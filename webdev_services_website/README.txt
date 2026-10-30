WEBSITE SETUP
=============

Pages:
- index.html
- services.html
- about.html
- contact.html

Assets:
- css/style.css
- js/main.js

Email form backend:
- submit-form.php sends contact enquiries and feedback to aqa29178@gmail.com using PHP's mail() function.
- Upload the complete folder to PHP-enabled hosting (for example, your hosting account's public_html directory).
- Open the website through its hosted domain, not by double-clicking index.html / using file://.
- PHP mail must be enabled and correctly configured by the hosting provider. Some hosts require an authenticated SMTP setup; if mail() is disabled or rejected, the form will show an error.
- Test with a real enquiry and check the inbox and spam folder.
- Do not add Gmail passwords or email account credentials to front-end HTML or JavaScript.
- For reliable delivery, configure authenticated SMTP through a server-side library/service on the hosting account.

Important:
- The forms send submitted data to aqa29178@gmail.com when server-side PHP mail is configured.
- The success confirmation is displayed only when the server reports that mail() accepted the message. This does not guarantee final inbox delivery.
