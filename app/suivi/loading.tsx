import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Search Card Skeleton */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Help Section Skeleton */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
