// components/ReviewCard.jsx
export default function ReviewCard({ review }) {
    const { customerName, rating, comment, date, serviceType } = review;
  
    const formattedDate = date
      ? new Date(date._seconds * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{customerName || "Anonymous User"}</h3>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex items-center text-yellow-500">
            {'★'.repeat(rating)}
            {'☆'.repeat(5 - rating)}
            <span className="ml-2 text-gray-700 text-sm">({rating} / 5)</span>
          </div>
        </div>
        {serviceType && (
            <p className="text-sm text-gray-600 mb-2 italic">Service: {serviceType}</p>
        )}
        <p className="text-gray-700 text-base">
          {comment}
        </p>
      </div>
    );
  }