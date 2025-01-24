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
  const [natsServer, setNatsServer] = useState<string>('') // Add NATS server state

  const validateIPAddress = (ip: string) => {
    const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!pattern.test(ip)) return false;
    return ip.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
  };

  const handleMove = async () => {
    try {
      if (!natsServer || !validateIPAddress(natsServer)) {
        toast({
          title: 'Invalid IP Address',
          description: 'Please enter valid IP in format: xxx.xxx.x.xxx',
          variant: 'destructive',
        })
        return
      }
      
      const natsUrl = `nats://${natsServer}:4222`;

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
        natsServer: natsUrl // Include NATS server in the request
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
          natsServer: natsUrl // Pass NATS server to API
        }),
      })

      toast({
        title: 'Success',
        description: 'Camera movement initiated',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send command',
        variant: 'destructive',
      })
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
              {/* Add NATS server input */}
              <div>
                <Label className="text-sm font-medium" htmlFor="natsServer">NATS Server IP Address</Label>
                <Input
                  id="natsServer"
                  type="text"
                  placeholder="xxx.xxx.x.xxx"
                  pattern="^(\d{1,3}\.){3}\d{1,3}$"
                  className="mt-1.5"
                  value={natsServer}
                  onChange={(e) => setNatsServer(e.target.value)}
                />
              </div>

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
              disabled={!camera || !pan || !tilt || !zoom || !natsServer}
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