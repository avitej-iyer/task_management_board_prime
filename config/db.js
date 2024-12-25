const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log('MongoDB Connected...');

        // Test database connection
        const db = client.db('task_db'); // Use your database name
        const collections = await db.listCollections().toArray();
        console.log('Existing Collections:', collections);
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = { connectDB, client };
