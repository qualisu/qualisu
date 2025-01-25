import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const VERIFIED_EMAIL = 'okcuoglu.alpkaan@yandex.com'

export async function POST(request: Request) {
  try {
    const { subject, trends, imageData } = await request.json()

    const trendsList = trends
      .map(
        (trend: any) => `
      ${
        trend.message ||
        `
      - Model: ${trend.name}
      - Arıza Oranı: %${trend.increasePercentage}
      - Dönem: ${trend.period}
      ${
        trend.additionalInfo
          ? `
      - Arıza Sayısı: ${trend.additionalInfo.failureCount}
      - Toplam Araç: ${trend.additionalInfo.vehicleCount}`
          : ''
      }`
      }
    `
      )
      .join('\n')

    const emailData: any = {
      from: 'Qualisu <onboarding@resend.dev>',
      to: VERIFIED_EMAIL,
      subject: subject,
      text: `Qualisu Trend Analizi Bildirimi\n\nAşağıdaki modellerde kritik arıza oranı tespit edildi:\n\n${trendsList}`
    }

    // Add HTML version with embedded image if screenshot is available
    if (imageData) {
      emailData.html = `
        <html>
          <body>
            <h1>Qualisu Trend Analizi Bildirimi</h1>
            <p>Aşağıdaki modellerde kritik arıza oranı tespit edildi:</p>
            <pre>${trendsList}</pre>
            <h2>Analiz Ekran Görüntüsü:</h2>
            <img src="${imageData}" alt="Analiz Ekran Görüntüsü" style="max-width: 100%; height: auto;" />
          </body>
        </html>
      `
    }

    const data = await resend.emails.send(emailData)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Mail gönderimi hatası:', error)
    return NextResponse.json({ error })
  }
}
