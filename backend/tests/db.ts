import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

export async function connectTestDB() {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
        dbName: "test",
    });


}

export async function clearDB() {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.collections();
    await Promise.all(
        collections?.map(async (c) => {
            try {
                await c.deleteMany({});
            } catch {

            }
        })
    );
}

export async function disconnectDB() {
    if (mongoose.connection.readyState != 0) {
        try {
            await mongoose.connection.dropDatabase();

        } catch {

        }
        await mongoose.connection.close();
    }

    if (mongod) {
        await mongod.stop();
    }
}