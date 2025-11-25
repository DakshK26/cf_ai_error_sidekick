export default {
    async fetch(request: Request): Promise<Response> {
        return new Response("Hello from cf_ai_error_sidekick worker", {
            status: 200
        });
    }
};
