import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import '../_lifecycle';

/*never unit tested in Node.js complete different from Java, 
the saying goes "When someone imports module X, give them this fake instead"

Vitest rewrites the file so all vi.mock() factories run before the imports
the consquence: anything thats referenced inside a vi.mock() must already exist, 
therefore we use vi.hoisted or define everything inside the factory
*/

//vi.fn() creates a spy that returns an undefined by default

// Hoist the fn so it's available inside mock factories
const { generateTokenMock } = vi.hoisted(() => ({
    generateTokenMock: vi.fn().mockReturnValue('MOCK_JWT_TOKEN'),
}));

// --- Mock User (use the SAME specifier you import below) ---
vi.mock('../../src/models/User', () => {
    class UserMock {
        static findOne = vi.fn();
        constructor(data: any) { Object.assign(this, data); }
        save = vi.fn().mockResolvedValue({ id: 'user-123', ...this });
        comparePasswords = vi.fn();
    }
    return { default: UserMock };
});

// --- Mock jwt util with BOTH named and default, to cover either import style ---
vi.mock('../../src/utils/jwt', () => ({
    __esModule: true,
    generateToken: generateTokenMock,          // named export
}));

// Import SUT *after* mocks
import { authenticateUser, registerUser } from '../../src/services/user.service';
import User from '../../src/models/User';

describe('registerUser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('registers new user, returns token and success message', async () => {
        (User as any).findOne.mockResolvedValue(null);

        const data = {
            username: 'max',
            email: 'max@example.com',
            age: 28,
            height: 180,
            password: 's3cret',
            weight: 75,
        };

        const result = await registerUser(data);

        expect((User as any).findOne).toHaveBeenCalledWith({ email: 'max@example.com' });
        expect(generateTokenMock).toHaveBeenCalledWith('user-123');
        expect(result).toEqual({
            token: 'MOCK_JWT_TOKEN',
            message: 'User successfully registered',
        });
    });

    it('throws error code 400 if user with this email already exists', async () => {
        (User as any).findOne.mockResolvedValue({ email: 'max@example.com' });

        const data = {
            username: 'max',
            email: 'max@example.com',
            age: 28,
            height: 180,
            password: 's3cret',
            weight: 75,
        };

        await expect(registerUser(data)).rejects.toMatchObject({
            statusCode: 400,
            message: 'User with this email already exists',
        });

        expect(generateTokenMock).not.toHaveBeenCalled();
    })
});

describe('authenticateUser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an token if credentials are correct', async () => {
        const email = 'max@example.com';
        const password = 'password123';
        const user_id = '1234';
        const user = new (User as any)({ id: user_id, email: email });
        user.comparePasswords = vi.fn().mockResolvedValue(true);
        (User as any).findOne.mockResolvedValue(user);

        const token = await authenticateUser(email, password);

        expect((User as any).findOne).toHaveBeenCalledWith({ email });
        expect(user.comparePasswords).toHaveBeenCalledWith(password);
        expect(generateTokenMock).toHaveBeenCalledWith(user_id);
        expect(token).toEqual({ token: 'MOCK_JWT_TOKEN' });

    })

    it('throws error code 401 if user with invalid password tries to authenticate', async () => {
        const email = 'max@example.com';
        const password = 'password123';
        const user_id = '1234';
        const user = new (User as any)({ id: user_id, email: email });
        user.comparePasswords = vi.fn().mockResolvedValue(false);
        (User as any).findOne.mockResolvedValue(user);

        await expect(authenticateUser(email, password)).rejects.toMatchObject({
            statusCode: 401,
            message: 'Invalid email or password',
        });

        expect(generateTokenMock).not.toHaveBeenCalled();
    });

    it('throws error code 401 if user with invalid email tries to authenticate', async () => {
        const email = 'max@example.com';
        const password = 'password123';
        const user_id = '1234';
        (User as any).findOne.mockResolvedValue(null);

        await expect(authenticateUser(email, password)).rejects.toMatchObject({
            statusCode: 401,
            message: 'Invalid email or password',
        });

        expect(generateTokenMock).not.toHaveBeenCalled();

    })
});
