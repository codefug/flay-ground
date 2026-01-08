import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Express BFF API",
			version: "1.0.0",
			description:
				"BFF(Backend For Frontend) 패턴 실험을 위한 Express API 문서",
			contact: {
				name: "API Support",
			},
		},
		servers: [
			{
				url: "http://localhost:3002",
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "JWT Authorization header using the Bearer scheme",
				},
			},
		},
		tags: [
			{
				name: "Auth",
				description: "인증 관련 API",
			},
			{
				name: "Health",
				description: "헬스 체크 API",
			},
			{
				name: "Example",
				description: "예제 API",
			},
		],
	},
	apis: ["./src/index.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
