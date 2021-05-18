export = {
    server(message: string): string {
        return `> [server]: ${message}`;
    },
    status: {
        "404": "Not found",
        "500": "Error! Contact the administrator",
    },
};
