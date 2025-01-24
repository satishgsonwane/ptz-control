// app/api/nats/route.ts
import { connect, NatsConnection } from 'nats'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { subject, message, natsServer } = body

    // Connect to NATS server using the provided address
    const nc: NatsConnection = await connect({ servers: natsServer })

    // Publish message
    await nc.publish(subject, JSON.stringify(message))
    
    // Close connection
    await nc.close()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('NATS error:', error)
    return NextResponse.json(
      { error: 'Failed to send NATS message' },
      { status: 500 }
    )
  }
}