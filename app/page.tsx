'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

export default function PTZControl() {
  const [camera, setCamera] = useState<string>('')
  const [pan, setPan] = useState<string>('')
  const [tilt, setTilt] = useState<string>('')
  const [zoom, setZoom] = useState<string>('')
  const [ip1, setIp1] = useState<string>('')
  const [ip2, setIp2] = useState<string>('')
  const [ip3, setIp3] = useState<string>('')
  const [ip4, setIp4] = useState<string>('')

  const validateIPOctet = (value: string) => {
    const num = parseInt(value)
    return num >= 0 && num <= 255
  }

  const handleMove = async () => {
    try {
      // Validate IP octets
      if (!ip1 || !ip2 || !ip3 || !ip4 || 
          !validateIPOctet(ip1) || !validateIPOctet(ip2) || 
          !validateIPOctet(ip3) || !validateIPOctet(ip4)) {
        toast({
          title: 'Invalid IP Address',
          description: 'Please enter valid IP address (0-255 for each octet)',
          variant: 'destructive',
        })
        return
      }

      const natsServer = `${ip1}.${ip2}.${ip3}.${ip4}`
      const natsUrl = `nats://${natsServer}:4222`

      const panValue = Number(pan)
      const tiltValue = Number(tilt)
      const zoomValue = Number(zoom)

      if (
        panValue < -55 || panValue > 55 ||
        tiltValue < -20 || tiltValue > 20 ||
        zoomValue < 0 || zoomValue > 16000
      ) {
        toast({
          title: 'Invalid input values', 
          description: 'Please check the input ranges',
          variant: 'destructive',
        })
        return
      }

      // Send NATS message
      const message = {
        pansetpoint: panValue,
        tiltsetpoint: tiltValue,
        zoomsetpoint: zoomValue,
      }

      console.log('Sending message:', message)
      
      await fetch('/api/nats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `ptzcontrol.camera${camera}`,
          message,
        }),
      })

      toast({
        title: 'Success',
        description: 'Camera movement initiated',
      })
    } catch (error) {
      console.error('Failed to send command:', error)
      toast({
        title: 'Error',
        description: 'Failed to send command',
        variant: 'destructive',
      })
    }
  }

  // Handle input focus advancing
  const handleIpInput = (
    value: string, 
    setter: (value: string) => void,
    nextInput?: HTMLInputElement
  ) => {
    if (value.length > 3) return
    const numValue = value.replace(/\D/g, '')
    setter(numValue)
    if (numValue.length === 3 && nextInput) {
      nextInput.focus()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">PTZ Camera Control</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="bg-muted">
            <CardTitle>Camera Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              {/* IP Address inputs */}
              <div>
                <Label className="text-sm font-medium">NATS Server IP Address</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    type="text"
                    maxLength={3}
                    className="w-[4.5rem] text-center"
                    value={ip1}
                    onChange={(e) => handleIpInput(e.target.value, setIp1, document.getElementById('ip2') as HTMLInputElement)}
                  />
                  <span className="text-lg">.</span>
                  <Input
                    id="ip2"
                    type="text"
                    maxLength={3}
                    className="w-[4.5rem] text-center"
                    value={ip2}
                    onChange={(e) => handleIpInput(e.target.value, setIp2, document.getElementById('ip3') as HTMLInputElement)}
                  />
                  <span className="text-lg">.</span>
                  <Input
                    id="ip3"
                    type="text"
                    maxLength={3}
                    className="w-[4.5rem] text-center"
                    value={ip3}
                    onChange={(e) => handleIpInput(e.target.value, setIp3, document.getElementById('ip4') as HTMLInputElement)}
                  />
                  <span className="text-lg">.</span>
                  <Input
                    id="ip4"
                    type="text"
                    maxLength={3}
                    className="w-[4.5rem] text-center"
                    value={ip4}
                    onChange={(e) => handleIpInput(e.target.value, setIp4)}
                  />
                </div>
              </div>

              {/* Rest of the form remains the same */}
              <div>
                <Label className="text-sm font-medium" htmlFor="camera">Camera Selection</Label>
                <Select value={camera} onValueChange={setCamera}>
                  <SelectTrigger id="camera" className="mt-1.5">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((id) => (
                      <SelectItem key={id} value={id.toString()}>
                        Camera {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium" htmlFor="pan">Pan Angle</Label>
                  <Input
                    id="pan"
                    type="number"
                    placeholder="-55° to 55°"
                    className="mt-1.5"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium" htmlFor="tilt">Tilt Angle</Label>
                  <Input
                    id="tilt"
                    type="number"
                    placeholder="-20° to 20°"
                    className="mt-1.5"
                    value={tilt}
                    onChange={(e) => setTilt(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium" htmlFor="zoom">Zoom Level</Label>
                  <Input
                    id="zoom"
                    type="number"
                    placeholder="0 to 16000"
                    className="mt-1.5"
                    value={zoom}
                    onChange={(e) => setZoom(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleMove}
              disabled={!camera || !pan || !tilt || !zoom || !ip1 || !ip2 || !ip3 || !ip4}
              className="w-full"
            >
              Move Camera
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}