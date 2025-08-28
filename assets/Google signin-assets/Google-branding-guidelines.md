# Sign in with Google Branding Guidelines

From:   https://developers.google.com/identity/branding-guidelines

## Render HTML button element

<button class="gsi-material-button">
  <div class="gsi-material-button-state"></div>
  <div class="gsi-material-button-content-wrapper">
    <div class="gsi-material-button-icon">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
    </div>
    <span class="gsi-material-button-contents">Continue with Google</span>
    <span style="display: none;">Continue with Google</span>
  </div>
</button>


## Create a custom Sign in with Google Button

Using our Google Identity Services SDKs or any of the other options covered in previous sections is strongly recommended as it enables Google users to more easily identify the Google brand. The more easily users can identify an action button, the more likely they are to interact with it.

If you, however, need to adapt the button to match your app design, adhere to the following guidelines.

### Size

You can scale the button as needed for different devices and screen sizes, but you must preserve the aspect ratio so that the Google logo is not stretched.

### Text

To encourage users to click the button, we recommend the call-to-action text "Sign in with Google", "Sign up with Google", or "Continue with Google". It should be clear to the user that they are signing into your app or signing up for your app with their Google credentials, not signing up or registering for a Google account on your app.

### Color

The default state of the buttons are shown below. The button must always include the standard color for the Google "G".

Theme	Example	
Light	light themed pill shaped Sign in with Google button	Fill: #FFFFFF
Stroke: #747775 | 1px | inside
Font: #1F1F1F | Roboto Medium | 14/20
Dark	dark themed pill shaped Sign in with Google button	Fill: #131314
Stroke: #8E918F | 1px | inside
Font: #E3E3E3 | Roboto Medium | 14/20
Neutral	neutral themed pill shaped Sign in with Google button	Fill: #F2F2F2
Stroke: No stroke
Font: #1F1F1F | Roboto Medium | 14/20
Font

The button font is Roboto Medium, a TrueType font. To install, first download the Roboto font and unzip the download bundle. On Mac, just double-click Roboto-Medium.ttf, then click "Install Font". On Windows, drag the file to "My Computer" > "Windows" > "Fonts" folder.

### Padding

Android	12px left padding before the Google logo, 10px right padding after the Google logo and 12px right padding after the Sign in with Google text
iOS	16px left padding before the Google logo, 12px right padding after the Google logo and 16px right padding after the Sign in with Google text
Web (mobile + desktop)	12px left padding before the Google logo, 10px right padding after the Google logo and 12px right padding after the Sign in with Google text
Reference	Sign in with Google button padding reference

### Google logo in the "Sign in with Google" button

Regardless of the text, you can't change the size or color of the Google "G" logo. It must be the standard color version and appear on a white background. If you need to create your own custom size Google logo, start with any of the logo sizes included in the download bundle.

Google G icon