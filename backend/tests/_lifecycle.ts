import { beforeAll, afterAll, afterEach } from "vitest";
import { clearDB, connectTestDB, disconnectDB } from "./db";

beforeAll(async () => {
    await connectTestDB();
});

afterAll(async () => {
    await disconnectDB();
})

afterEach(async () => {
    await clearDB();
})