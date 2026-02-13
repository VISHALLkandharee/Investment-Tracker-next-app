// src/components/ui/LoadingSkeleton.tsx
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-32"></div>
    </div>
  );
}

export function PortfolioCardSkeleton() {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
      </td>
    </tr>
  );
}