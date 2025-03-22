import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface VehicleInfoProps {
  vehicleInfo: {
    model: string
    chassisNo: string
    fertNo: string
    zobasNo: string
    country: string
  }
}

export default function VehicleInfo({ vehicleInfo }: VehicleInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Araç Bilgileri:</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Image
            src="/novolux.png"
            alt="Vehicle"
            width={150}
            height={150}
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Model Bilgisi:
              </span>
              <span className="text-sm">{vehicleInfo.model}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Sasi No:
              </span>
              <span className="text-sm">{vehicleInfo.chassisNo}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Ülke:
              </span>
              <span className="text-sm">{vehicleInfo.country}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Fert No:
              </span>
              <span className="text-sm text-red-500 font-bold">-</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">
                ZOBAS No:
              </span>
              <span className="text-sm text-red-500 font-bold">-</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
