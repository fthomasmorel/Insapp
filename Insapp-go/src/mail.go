package main

import (
	"net/smtp"
    "bytes"
	"html/template"
)

func SendEmail(to string, subject string, body string) {
	config, _ := Configuration()
    from := config.Email
	pass := config.Password
	cc := config.Email

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
        "Cc: " + cc + "\n" +
		"Subject: " + subject + "\n" +
        "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n" +
		body

	smtp.SendMail("smtp.gmail.com:587", smtp.PlainAuth("", from, pass, "smtp.gmail.com"), from, []string{to}, []byte(msg))
}

func SendAssociationEmailSubscription(email string, password string) error {
    data := struct {
        Email string
        Password  string
    }{ Email: email, Password: password }
	body, err := ParseTemplate("association_subscription_template.html", data)
    if err == nil {
        SendEmail(email, "T'es identifiants Insapp", body)
    }
    return err
}

func ParseTemplate(templateFileName string, data interface{}) (string, error) {
	t, err := template.ParseFiles(templateFileName)
	if err != nil {
		return "", err
	}
	buf := new(bytes.Buffer)
	if err = t.Execute(buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}
