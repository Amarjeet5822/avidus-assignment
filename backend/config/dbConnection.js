import mongodb from 'mongodb';

const dbConnect = async () => {
    try {
        const client = new mongodb.MongoClient(process.env.MONGO_URL);
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default dbConnect;