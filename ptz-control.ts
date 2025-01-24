// app/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

export default function PTZControl() {
  const [camera, setCamera] = useState<string>('')
  const [pan, setPan] = useState<string>('')
  const [tilt, setTilt] = useState<string>('')
  const [zoom, setZoom] = useState<string>('')

  const handleMove = async () => {
    try {
      // Validate inputs
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
        zoomsetpoint: zoomValue
      }
      
      await fetch('/api/nats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `ptzcontrol.camera${camera}`,
          message
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
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>PTZ Camera Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="camera">Camera</Label>
            <Select value={camera} onValueChange={setCamera}>
              <SelectTrigger id="camera">
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

          <div className="space-y-2">
            <Label htmlFor="pan">Pan (-55 to 55)</Label>
            <Input
              id="pan"
              type="number"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              min={-55}
              max={55}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tilt">Tilt (-20 to 20)</Label>
            <Input
              id="tilt"
              type="number"
              value={tilt}
              onChange={(e) => setTilt(e.target.value)}
              min={-20}
              max={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoom">Zoom (0 to 16000)</Label>
            <Input
              id="zoom"
              type="number"
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              min={0}
              max={16000}
            />
          </div>

          <Button 
            onClick={handleMove}
            disabled={!camera || !pan || !tilt || !zoom}
            className="w-full"
          >
            Move Camera
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}