const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// Email SMTP configuration
const emailConfig = {
  service: "gmail",
  auth: {
    user: "phamloc842002@gmail.com",
    pass: "inzd veri zcxm pvbc",
  },
};

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport(emailConfig);

// API for sending OTP verification email
exports.sendVerificationEmail = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      // Check for POST method
      if (request.method !== "POST") {
        return response.status(405).json({ error: "Method Not Allowed" });
      }

      // Get data from request
      const { email, otp } = request.body;

      if (!email || !otp) {
        return response.status(400).json({ error: "Missing required parameters" });
      }

      // Create email content
      const mailOptions = {
        from: "Weather Forecast Service <phamloc842002@gmail.com>",
        to: email,
        subject: "Email Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #5372F0; text-align: center;">Weather Forecast Service</h2>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">Thank you for subscribing to our Weather Forecast Service. Please use the following verification code to complete your subscription:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">${otp}</div>
            </div>
            <p style="font-size: 16px;">This code will expire in 10 minutes.</p>
            <p style="font-size: 16px;">If you didn't request this code, please ignore this email.</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">Weather Forecast Service - Stay updated with the latest weather information.</p>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Return success result
      return response.status(200).json({ success: true, message: "Verification email sent" });
    } catch (error) {
      console.error("Error sending email:", error);
      return response.status(500).json({ error: "Failed to send email", details: error.message });
    }
  });
});

// API for sending subscription confirmation email
exports.sendSubscriptionConfirmation = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      // Check for POST method
      if (request.method !== "POST") {
        return response.status(405).json({ error: "Method Not Allowed" });
      }

      // Get data from request
      const { 
        email, 
        location,
        cityName,
        temperature,
        windSpeed,
        humidity,
        iconUrl,
        iconText,
        date
      } = request.body;

      if (!email || !location) {
        return response.status(400).json({ error: "Missing required parameters" });
      }

      // Determine if we have weather data
      const hasWeatherData = cityName && temperature && windSpeed && humidity && iconUrl && iconText;
      
      // Create email content
      const mailOptions = {
        from: "Weather Forecast Service <phamloc842002@gmail.com>",
        to: email,
        subject: "Weather Forecast Subscription Confirmed",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #5372F0; text-align: center;">Weather Forecast Service</h2>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">Thank you for subscribing to our Weather Forecast Service!</p>
            <p style="font-size: 16px;">You will now receive daily weather forecasts for <strong>${cityName || location}</strong>.</p>
            
            ${hasWeatherData ? `
            <div style="background-color: #5372F0; color: white; border-radius: 10px; padding: 15px; margin: 20px 0;">
              <h3 style="text-align: center; margin: 0 0 10px 0;">Current Weather Information</h3>
              <table style="width: 100%; border-collapse: collapse; color: white;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>City Name:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${cityName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Date:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${date || 'Today'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Temperature:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${temperature}°C</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Condition:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${iconText}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Wind Speed:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${windSpeed} km/h</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Humidity:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${humidity}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px;"><strong>Weather Icon:</strong></td>
                  <td style="padding: 8px;"><img src="${iconUrl}" alt="${iconText}" style="width: 50px; height: 50px; background-color: white; border-radius: 50%; padding: 5px;"></td>
                </tr>
              </table>
            </div>
            ` : `
            <div style="text-align: center; margin: 30px 0;">
              <img src="https://openweathermap.org/img/wn/10d@2x.png" alt="Weather Icon" style="width: 100px; height: 100px;">
            </div>
            `}
            
            <p style="font-size: 16px;">To unsubscribe at any time, please visit our app and use the unsubscribe option.</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">Weather Forecast Service - Stay updated with the latest weather information.</p>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Return success result
      return response.status(200).json({ success: true, message: "Subscription confirmation email sent" });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      return response.status(500).json({ error: "Failed to send confirmation email", details: error.message });
    }
  });
});

// API for sending unsubscribe confirmation email
exports.sendUnsubscribeConfirmation = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      // Check for POST method
      if (request.method !== "POST") {
        return response.status(405).json({ error: "Method Not Allowed" });
      }

      // Get data from request
      const { email } = request.body;

      if (!email) {
        return response.status(400).json({ error: "Missing required parameters" });
      }

      // Create email content
      const mailOptions = {
        from: "Weather Forecast Service <phamloc842002@gmail.com>",
        to: email,
        subject: "Unsubscribed from Weather Forecast Service",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #5372F0; text-align: center;">Weather Forecast Service</h2>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">You have successfully unsubscribed from our Weather Forecast Service.</p>
            <p style="font-size: 16px;">We're sorry to see you go. If you have any feedback that could help us improve our service, please let us know.</p>
            <p style="font-size: 16px;">If you wish to resubscribe in the future, you can do so through our app at any time.</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">Thank you for using our Weather Forecast Service.</p>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Return success result
      return response.status(200).json({ success: true, message: "Unsubscribe confirmation email sent" });
    } catch (error) {
      console.error("Error sending unsubscribe confirmation email:", error);
      return response.status(500).json({ error: "Failed to send unsubscribe confirmation email", details: error.message });
    }
  });
});

// API for sending daily weather forecast email
exports.sendDailyForecast = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      // Check for POST method
      if (request.method !== "POST") {
        return response.status(405).json({ error: "Method Not Allowed" });
      }

      // Get data from request
      const { 
        email, 
        cityName, 
        temperature, 
        windSpeed, 
        humidity, 
        iconUrl, 
        iconText, 
        date, 
        forecastData 
      } = request.body;

      // Check required fields
      if (!email || !cityName) {
        return response.status(400).json({ error: "Missing required parameters" });
      }

      // Create email content with all required information
      const mailOptions = {
        from: "Weather Forecast Service <phamloc842002@gmail.com>",
        to: email,
        subject: `Weather Forecast for ${cityName} - ${date || 'Today'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
            <h2 style="color: #5372F0; text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Weather Forecast Service</h2>
            
            <!-- Required Weather Information Section -->
            <div style="background-color: #5372F0; color: white; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
              <h3 style="text-align: center; margin: 0 0 10px 0;">Essential Weather Information</h3>
              <table style="width: 100%; border-collapse: collapse; color: white;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>City Name:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${cityName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Date:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${date || 'Today'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Temperature:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${temperature || 'N/A'}°C</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Condition:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${iconText || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Wind Speed:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${windSpeed || 'N/A'} km/h</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);"><strong>Humidity:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${humidity || 'N/A'}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px;"><strong>Weather Icon:</strong></td>
                  <td style="padding: 8px;"><img src="${iconUrl || 'https://openweathermap.org/img/wn/10d@2x.png'}" alt="${iconText || 'Weather Icon'}" style="width: 50px; height: 50px; background-color: white; border-radius: 50%; padding: 5px;"></td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 20px 0 10px 0;">
              <h3 style="font-size: 22px; margin: 0;">${cityName}</h3>
              <p style="color: #666; margin: 5px 0;">${date || 'Today'}</p>
            </div>
            
            <div style="background-color: #f0f7ff; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: center; align-items: center;">
                <img src="${iconUrl || 'https://openweathermap.org/img/wn/10d@2x.png'}" alt="${iconText || 'Weather condition'}" style="width: 80px; height: 80px;">
                <div style="text-align: left; margin-left: 15px;">
                  <h2 style="margin: 0; font-size: 36px;">${temperature || 'N/A'}°C</h2>
                  <p style="margin: 5px 0; font-size: 18px;">${iconText || 'Unknown'}</p>
                </div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 120px; background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 5px; text-align: center;">
                <p style="font-size: 14px; color: #666; margin: 0;">Humidity</p>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${humidity || 'N/A'}%</p>
              </div>
              <div style="flex: 1; min-width: 120px; background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 5px; text-align: center;">
                <p style="font-size: 14px; color: #666; margin: 0;">Wind Speed</p>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${windSpeed || 'N/A'} km/h</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; background-color: #f0f7ff; border-radius: 10px; padding: 15px; text-align: center;">
              <p style="font-size: 16px;">Stay prepared for the day ahead with this weather update!</p>
              <p style="font-size: 14px; color: #666;">Updated ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              Weather Forecast Service - Stay updated with the latest weather information.
            </p>
            <p style="font-size: 12px; color: #999; text-align: center;">
              To unsubscribe, please visit our app and use the unsubscribe option.
            </p>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Return success result
      return response.status(200).json({ success: true, message: "Daily forecast email sent" });
    } catch (error) {
      console.error("Error sending daily forecast email:", error);
      return response.status(500).json({ error: "Failed to send daily forecast email", details: error.message });
    }
  });
}); 