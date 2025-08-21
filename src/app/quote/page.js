import Link from 'next/link';

export default function QuotePage() {
  const email = 'solarlgao@gmail.com';
  const subject = encodeURIComponent('Free Solar Quote Request');
  const body = encodeURIComponent(
    `Hi SOLAR LGAO Team,%0D%0A%0D%0AI'd like a free quote for a solar system.%0D%0A%0D%0AName:%0D%0APhone:%0D%0ACity:%0D%0AApprox monthly bill (PKR):%0D%0AComments:%0D%0A`
  );

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
  const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Get a Free Quote</h1>
            <p className="text-muted-foreground">Share a few details and we’ll get back to you shortly.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-3">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Open in Gmail
            </a>
            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-accent transition-colors"
            >
              Email via Default App
            </a>
            <p className="text-xs text-muted-foreground">If nothing happens, you may need to set a default email app or use the Gmail option above.</p>
            <p className="text-xs text-muted-foreground">You can also email us directly at <span className="font-medium">{email}</span>.</p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-primary hover:text-primary/80 font-medium">Back to Articles</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
