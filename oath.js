require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPES = process.env.SCOPES;


// app.get("/", async (req, res) => {
//   if (tokenCache.get(req.sessionID)) {
//     try {
//       const response = await axios.get(
//         `https://api.hubapi.com/crm/v3/objects/contacts`,
//         {
//           headers: {
//             Authorization: `Bearer ${tokenCache.get(req.sessionID)}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log(response.data);
//       res.send(response.data);
//     } catch (error) {
//       console.error("Error:", error.response ? error.response.data : error);
//     }
//   } else {
//     const authURL = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(
//       CLIENT_ID
//     )}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(
//       REDIRECT_URI
//     )}`;
//     res.redirect(authURL);
//   }
// });

// // Callback
// app.get("/oauth-callback", async (req, res) => {
//   console.log(req.query.code);
//   if (req.query.code) {
//     const params = new URLSearchParams({
//       grant_type: "authorization_code",
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       redirect_uri: REDIRECT_URI,
//       code: req.query.code,
//     });

//     try {
//       const response = await axios.post(
//         "https://api.hubapi.com/oauth/v1/token",
//         params.toString(), // Converts the parameters to URL-encoded string
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       tokens = response.data;

//       accessToken = tokens.access_token;
//       refreshToken = tokens.refresh_token;

//       tokenCache.set(
//         req.sessionID,
//         accessToken,
//         Math.round(tokens.expires_in * 0.75)
//       );

//       res.redirect("/");
//     } catch (error) {
//       //   console.error("Error:", error.response); // More detailed error logging
//       res.status(500).send("Failed to retrieve access token");
//     }
//   }
// });