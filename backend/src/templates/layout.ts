import { env } from "../config/env.js";

/**
 * Copyright © GLANZ PREMIUM CAR WASH
 * Premium email template layout wrapper
 */
export const emailLayout = (content: string, previewText: string = "Glanz Premium Car Wash Update"): string => {
  const frontendUrl = env.FRONTEND_URL || "http://localhost:3000";
  const goldLogoUrl = "cid:gold_logo";
  const whiteLogoUrl = "cid:white_logo";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${previewText}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #0B0B0B;
          color: #ffffff;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #0B0B0B;
          border: 1px solid #2E2E2E;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background-color: #0B0B0B;
          padding: 35px 20px;
          text-align: center;
          border-bottom: 1px solid #2E2E2E;
        }
        .logo-img {
          height: 60px;
          width: auto;
          margin-bottom: 15px;
          display: inline-block;
          vertical-align: middle;
        }
        .logo-text {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #D8AB44;
          text-transform: uppercase;
          margin: 0;
        }
        .body {
          padding: 40px 30px;
          background-color: #0B0B0B;
          line-height: 1.6;
          color: #ffffff;
        }
        .footer {
          background-color: #2E2E2E;
          padding: 30px 20px;
          text-align: center;
          border-top: 1px solid #2E2E2E;
          font-size: 12px;
          color: #F5EFE2;
        }
        .footer-logo {
          height: 30px;
          width: auto;
          margin-bottom: 15px;
          display: inline-block;
        }
        .footer-links {
          margin: 15px 0;
        }
        .footer-link {
          color: #D8AB44;
          text-decoration: none;
          margin: 0 10px;
          font-weight: 600;
        }
        .footer-link:hover {
          text-decoration: underline;
        }
        .btn-gold {
          display: inline-block;
          background-color: #D8AB44;
          color: #0B0B0B !important;
          font-weight: bold;
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: center;
          letter-spacing: 0.5px;
          transition: background-color 0.2s;
        }
        .btn-gold:hover {
          background-color: #bfa03f;
        }
      </style>
    </head>
    <body>
      <div style="display: none; max-height: 0px; overflow: hidden;">
        ${previewText}
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0B0B; padding: 20px 0;">
        <tr>
          <td>
            <div class="container">
              <!-- Header -->
              <div class="header">
                <img src="${goldLogoUrl}" alt="Glanz Premium Car Wash Logo" class="logo-img" /><br/>
                <div class="logo-text">GLANZ PREMIUM CAR WASH</div>
              </div>
              
              <!-- Content -->
              <div class="body">
                ${content}
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <img src="${whiteLogoUrl}" alt="Glanz Small Logo" class="footer-logo" /><br/>
                <div class="footer-links">
                  <a href="${frontendUrl}/privacy" class="footer-link" aria-label="Privacy Policy">Privacy Policy</a>
                  <span style="color: #666;">|</span>
                  <a href="${frontendUrl}/terms" class="footer-link" aria-label="Terms of Service">Terms & Conditions</a>
                </div>
                <p style="margin: 0 0 10px 0; font-size: 11px; color: #F5EFE2;">© ${new Date().getFullYear()} Glanz Premium Car Wash. All rights reserved.</p>
                <p style="margin: 0; font-size: 10px; color: #F5EFE2; opacity: 0.8;">You are receiving this secure automated email because you registered or requested a credential update.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
