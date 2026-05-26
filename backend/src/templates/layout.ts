/**
 * Copyright © GLANCE PREMIUM CAR WASH
 * Premium email template layout wrapper
 */
export const emailLayout = (content: string, previewText: string = "Glance Premium Car Wash Update"): string => {
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
          background-color: #080808;
          color: #f3f4f6;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #121212;
          border: 1px solid #1f2937;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background-color: #000000;
          padding: 30px 20px;
          text-align: center;
          border-bottom: 1px solid #1f2937;
        }
        .logo-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #d4a943; /* Golden Yellow logo accent */
          text-transform: uppercase;
        }
        .body {
          padding: 40px 30px;
          background-color: #121212; /* Light Black background */
          line-height: 1.6;
          color: #e5e7eb; /* Off-white text */
        }
        .footer {
          background-color: #000000;
          padding: 24px 20px;
          text-align: center;
          border-top: 1px solid #1f2937;
          font-size: 11px;
          color: #9ca3af;
        }
        .btn-gold {
          display: inline-block;
          background-color: #d4a943; /* Golden Yellow */
          color: #000000 !important;
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
          background-color: #b58d32;
        }
      </style>
    </head>
    <body>
      <div style="display: none; max-height: 0px; overflow: hidden;">
        ${previewText}
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #080808; padding: 20px 0;">
        <tr>
          <td>
            <div class="container">
              <!-- Header -->
              <div class="header">
                <div class="logo-text">GLANCE PREMIUM CAR WASH</div>
              </div>
              
              <!-- Content -->
              <div class="body">
                ${content}
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Glance Premium Car Wash. All rights reserved.</p>
                <p style="margin: 0;">You are receiving this secure automated email because you registered or requested a credential update.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
