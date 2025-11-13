export class AiTelemetry {
    static setListener(listener) {
        this.listener = listener;
    }
    static emit(event) {
        var _a;
        try {
            (_a = this.listener) === null || _a === void 0 ? void 0 : _a.call(this, event);
        }
        catch (error) {
            console.warn("AiTelemetry listener threw", error);
        }
    }
}
AiTelemetry.listener = null;
