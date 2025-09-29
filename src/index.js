import 'dotenv/config';
import app from "./app.js";
import connectDB from "./db/index.js";




const PORT = process.env.PORT || 8000;



connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    }).catch((err) => {
        console.error("MongoDB connection error", err);
        process.exit(1);

    })