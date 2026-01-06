import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Example BFF endpoint
app.get("/api/hello", (req, res) => {
	res.json({
		message: "Hello from Express BFF!",
		data: {
			framework: "Express",
			version: "4.x",
		},
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
