"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var email_service_1 = require("../src/lib/email-service");
function generateInvitationEmailTemplate(params) {
    var companyName = params.companyName, invitationLink = params.invitationLink, expiryDays = params.expiryDays;
    return "\n    <!DOCTYPE html>\n    <html>\n    <head>\n      <meta charset=\"utf-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <title>Admin Invitation</title>\n      <style>\n        body {\n          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n          line-height: 1.6;\n          margin: 0;\n          padding: 0;\n          background-color: #f4f4f5;\n        }\n        .container {\n          max-width: 600px;\n          margin: 40px auto;\n          background: white;\n          border-radius: 8px;\n          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n          overflow: hidden;\n        }\n        .header {\n          background: #3b82f6;\n          color: white;\n          padding: 24px;\n          text-align: center;\n        }\n        .header h1 {\n          margin: 0;\n          font-size: 24px;\n          font-weight: 600;\n        }\n        .content {\n          padding: 32px 24px;\n          background: white;\n        }\n        .message {\n          color: #374151;\n          font-size: 16px;\n          margin-bottom: 24px;\n        }\n        .button {\n          display: inline-block;\n          background: #3b82f6;\n          color: white;\n          padding: 12px 24px;\n          border-radius: 6px;\n          text-decoration: none;\n          font-weight: 500;\n          margin: 16px 0;\n          text-align: center;\n        }\n        .button:hover {\n          background: #2563eb;\n        }\n        .footer {\n          padding: 24px;\n          background: #f8fafc;\n          text-align: center;\n          color: #64748b;\n          font-size: 14px;\n          border-top: 1px solid #e2e8f0;\n        }\n        .note {\n          font-size: 14px;\n          color: #64748b;\n          margin-top: 16px;\n        }\n        .divider {\n          height: 1px;\n          background: #e2e8f0;\n          margin: 24px 0;\n        }\n        @media (max-width: 600px) {\n          .container {\n            margin: 0;\n            border-radius: 0;\n          }\n        }\n      </style>\n    </head>\n    <body>\n      <div class=\"container\">\n        <div class=\"header\">\n          <h1>Admin Invitation</h1>\n        </div>\n        <div class=\"content\">\n          <div class=\"message\">\n            <p>Hello,</p>\n            <p>You have been invited to be a Company Admin for <strong>".concat(companyName, "</strong>.</p>\n            <p>As a Company Admin, you'll have access to:</p>\n            <ul>\n              <li>Company dashboard and analytics</li>\n              <li>User management tools</li>\n              <li>System configuration settings</li>\n              <li>Performance monitoring features</li>\n            </ul>\n          </div>\n          <div style=\"text-align: center;\">\n            <a href=\"").concat(invitationLink, "\" class=\"button\">Accept Invitation</a>\n          </div>\n          <div class=\"note\">\n            <p>This invitation will expire in ").concat(expiryDays, " days. For security reasons, please do not forward this email to anyone.</p>\n          </div>\n          <div class=\"divider\"></div>\n          <div class=\"note\">\n            <p>If the button above doesn't work, copy and paste this link into your browser:</p>\n            <p style=\"word-break: break-all;\">").concat(invitationLink, "</p>\n          </div>\n        </div>\n        <div class=\"footer\">\n          <p>This is an automated message, please do not reply to this email.</p>\n          <p>&copy; ").concat(new Date().getFullYear(), " ").concat(companyName, ". All rights reserved.</p>\n        </div>\n      </div>\n    </body>\n    </html>\n  ");
}
function testInvitationEmail() {
    return __awaiter(this, void 0, void 0, function () {
        var testParams, emailHtml, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    testParams = {
                        companyName: 'Test Company Inc.',
                        invitationLink: 'http://localhost:3001/accept-invitation?token=test-token-123',
                        expiryDays: 7
                    };
                    emailHtml = generateInvitationEmailTemplate(testParams);
                    return [4 /*yield*/, (0, email_service_1.sendEmail)({
                            to: 'test@example.com', // Replace with your test email
                            subject: "Company Admin Invitation - ".concat(testParams.companyName),
                            text: "\n        You have been invited to be a Company Admin for ".concat(testParams.companyName, ".\n        \n        Click the link below to accept the invitation and set up your account:\n        ").concat(testParams.invitationLink, "\n        \n        This invitation will expire in ").concat(testParams.expiryDays, " days.\n      "),
                            html: emailHtml
                        })];
                case 1:
                    _a.sent();
                    console.log('Test email sent successfully!');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error sending test email:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testInvitationEmail();
