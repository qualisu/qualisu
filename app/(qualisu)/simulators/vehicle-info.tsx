import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function VehicleInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Araç Bilgileri:</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Image src="/novolux.png" alt="Vehicle" width={150} height={150} />
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Model Bilgisi:
              </span>
              <span className="text-sm">Novolux</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Sasi No:
              </span>
              <span className="text-sm">NNAM85AEL1G000434</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Fert No:
              </span>
              <span className="text-sm">389993014601</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                ZOBAS No:
              </span>
              <span className="text-sm">22533</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
