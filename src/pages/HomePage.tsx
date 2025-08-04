import { Link } from 'react-router-dom';
import { 
  Mountain, 
  Tent, 
  Home, 
  Sparkles, 
  Wifi, 
  Car, 
  Coffee, 
  Shield,
  Star,
  Users,
  Calendar,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Mountain,
      title: 'Natural Hot Springs',
      description: 'Relax in our mineral-rich natural hot springs with stunning mountain views.',
    },
    {
      icon: Tent,
      title: 'Luxury Camping',
      description: 'Experience glamping with premium amenities and comfortable accommodations.',
    },
    {
      icon: Home,
      title: 'Cozy Cabins',
      description: 'Stay in beautifully appointed cabins with modern comforts and rustic charm.',
    },
    {
      icon: Sparkles,
      title: 'Premium Sites',
      description: 'Exclusive luxury accommodations for the ultimate mountain retreat experience.',
    },
  ];

  const amenities = [
    { icon: Wifi, label: 'Free WiFi' },
    { icon: Car, label: 'Parking' },
    { icon: Coffee, label: 'Camp Store' },
    { icon: Shield, label: '24/7 Security' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      text: 'The hot springs were absolutely magical! Our cabin was perfect and the mountain views were breathtaking.',
    },
    {
      name: 'Mike Chen',
      rating: 5,
      text: 'Best glamping experience ever. The amenities were top-notch and the staff was incredibly helpful.',
    },
    {
      name: 'Emily Rodriguez',
      rating: 5,
      text: 'A perfect mountain getaway. The natural hot springs made our anniversary trip unforgettable.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen bg-mountain-hero bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative container-width h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Escape to Mountain Paradise
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover luxury camping and cozy cabins with natural hot springs access 
              in the heart of the Colorado Rockies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/sites" className="btn-primary text-lg px-8 py-3">
                Book Your Stay
              </Link>
              <a 
                href="#features" 
                className="btn-outline bg-white bg-opacity-10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-neutral-900 text-lg px-8 py-3"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
              Why Choose Pine Ridge?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Experience the perfect blend of adventure and relaxation in our mountain retreat.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3 text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-primary-50">
        <div className="container-width">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary-600 mr-2" />
                <span className="text-4xl font-bold text-primary-600">500+</span>
              </div>
              <p className="text-lg text-neutral-700">Happy Guests</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Mountain className="h-8 w-8 text-primary-600 mr-2" />
                <span className="text-4xl font-bold text-primary-600">10</span>
              </div>
              <p className="text-lg text-neutral-700">Unique Sites</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary-600 mr-2" />
                <span className="text-4xl font-bold text-primary-600">365</span>
              </div>
              <p className="text-lg text-neutral-700">Days Open</p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
              Resort Amenities
            </h2>
            <p className="text-xl text-neutral-600">
              Everything you need for a perfect mountain getaway.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-full mb-4">
                  <amenity.icon className="h-6 w-6 text-secondary-600" />
                </div>
                <p className="font-medium text-neutral-700">{amenity.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-neutral-100">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
              What Our Guests Say
            </h2>
            <p className="text-xl text-neutral-600">
              Don't just take our word for it.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary-500 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-semibold text-neutral-900">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-hot-spring bg-cover bg-center">
        <div className="container-width text-center">
          <div className="bg-white bg-opacity-95 rounded-lg p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
              Ready for Your Mountain Adventure?
            </h2>
            <p className="text-xl text-neutral-700 mb-8">
              Book your stay today and experience the magic of Pine Ridge Hot Springs Resort.
            </p>
            <Link 
              to="/sites" 
              className="btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              Explore Sites & Book Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}