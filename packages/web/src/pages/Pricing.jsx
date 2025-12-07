import axios from 'axios';

export default function Pricing({ user }) {
  const handleUpgrade = async () => {
    try {
      const response = await axios.post('/api/billing/checkout');
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      alert('Error: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
            <p className="text-gray-600 mb-6">Perfect for getting started</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Up to 500 links</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Basic search</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Chrome extension</span>
              </li>
            </ul>

            <button disabled className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-8 transform scale-105">
            <div className="inline-block bg-yellow-400 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-blue-100 mb-6">For power users and creators</p>

            <div className="mb-6">
              <span className="text-5xl font-bold">$3.99</span>
              <span className="text-blue-100">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Unlimited links</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Advanced search with OCR</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Private folders</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Export to CSV/PDF</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Public profile sharing</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Priority support</span>
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={user?.plan === 'pro'}
              className="w-full bg-yellow-400 text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {user?.plan === 'pro' ? 'Current Plan' : 'Upgrade Now'}
            </button>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-600">
          <p>All plans include 24/7 access and free updates.</p>
        </div>
      </div>
    </div>
  );
}
