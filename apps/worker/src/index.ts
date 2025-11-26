import { Router } from "./router";
import type { Env } from "./types";
import {
    handleRoot,
    handleHealth,
    handleAiTest,
    handleChat,
    handleDocsUpload,
} from "./handlers";

const router = new Router();

router.on("GET", "/", handleRoot);
router.on("GET", "/health", handleHealth);
router.on("GET", "/ai-test", handleAiTest);
router.on("POST", "/api/chat", handleChat);
router.on("POST", "/api/docs/upload", handleDocsUpload);

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        return router.route(request, env);
    },
};
