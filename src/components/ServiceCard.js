export default function ServiceCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary-green rounded-full p-4 mb-4">
        <div className="text-white text-2xl">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  )
}

