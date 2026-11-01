<?php
// =========================================================
// Kontaktformular-Verarbeitung für All-Inkl (PHP mail())
// Empfänger anpassen. Absender MUSS eine Adresse deiner Domain sein,
// sonst landen Mails im Spam.
// =========================================================

$empfaenger = 'info@meoform.de';
$absender   = 'info@meoform.de';   // Postfach oder Alias im KAS anlegen

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

// Honeypot: Bots füllen das versteckte Feld aus → stillschweigend ignorieren
if (!empty($_POST['website'])) {
    header('Location: danke.html');
    exit;
}

// Eingaben bereinigen
function clean(string $key, int $max = 2000): string {
    $value = trim((string)($_POST[$key] ?? ''));
    return mb_substr($value, 0, $max);
}

$name      = clean('name', 100);
$email     = clean('email', 200);
$telefon   = clean('telefon', 50);
$nachricht = clean('nachricht', 5000);

// Pflichtfelder & E-Mail prüfen
if ($name === '' || $nachricht === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: index.html?fehler=1#kontakt');
    exit;
}

// Schutz vor Header-Injection (Zeilenumbrüche in Kopfzeilen verbieten)
$name  = str_replace(["\r", "\n"], ' ', $name);
$email = str_replace(["\r", "\n"], '', $email);

$betreff = 'Neue Anfrage über meoform.de von ' . $name;

$text  = "Neue Anfrage über das Kontaktformular:\n\n";
$text .= "Name:     $name\n";
$text .= "E-Mail:   $email\n";
$text .= "Telefon:  " . ($telefon !== '' ? $telefon : '-') . "\n\n";
$text .= "Nachricht:\n$nachricht\n";

$headers  = "From: Meoform Website <$absender>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$ok = mail($empfaenger, '=?UTF-8?B?' . base64_encode($betreff) . '?=', $text, $headers, '-f' . $absender);

header('Location: ' . ($ok ? 'danke.html' : 'index.html?fehler=1#kontakt'));
exit;
