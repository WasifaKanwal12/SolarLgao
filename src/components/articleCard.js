// Reusable Article Card Component with new styling
const ArticleCard = ({ article }) => {
  // Manual date formatting to prevent hydration errors
  const formattedDate = new Date(article.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/'); // Ensure consistent separator
  
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <Image
          src={article.image}
          alt={article.title}
          width={800}
          height={400}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          {/* Tags are removed as per your request */}
          <div className="bg-white p-2 rounded-full shadow-md text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-file-text"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-400 uppercase tracking-widest">{article.category}</p>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{article.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{article.excerpt}</p>
        
        {/* Combined Author and Date into a single row */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <Link
          href={`/articles/${article.id}`}
          className="w-full mt-4 py-2 px-4 rounded-full font-bold text-sm transition-colors duration-300 text-center block bg-primary-green hover:bg-green-700"
          style={{ color: "white" }}
        >
          Read Full Article
        </Link>
      </div>
    </article>
  );
};