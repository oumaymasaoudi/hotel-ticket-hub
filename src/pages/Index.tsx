import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { 
  Hotel, TicketCheck, Eye, Users, Building2, Clock, CheckCircle, Star, 
  TrendingUp, Shield, Zap, BarChart3, ArrowRight, MessageSquare, 
  Award, Globe, Lock, Bell, FileText, HelpCircle, ChevronDown,
  Phone, Mail, MapPin, Play, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import luxuryBg from "@/assets/luxury-hotel-bg.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { value: "10K+", label: "Tickets traités", icon: TicketCheck },
    { value: "98%", label: "Satisfaction client", icon: Star },
    { value: "< 2h", label: "Temps moyen", icon: Clock },
    { value: "500+", label: "Hôtels partenaires", icon: Hotel },
  ];

  const features = [
    {
      icon: Zap,
      title: "Rapidité Exceptionnelle",
      description: "Résolution des incidents en moins de 2 heures en moyenne",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Shield,
      title: "Sécurité Maximale",
      description: "Protection des données conforme RGPD et standards internationaux",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: BarChart3,
      title: "Analytics Avancés",
      description: "Tableaux de bord détaillés pour optimiser vos opérations",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Bell,
      title: "Notifications Intelligentes",
      description: "Alertes en temps réel pour ne rien manquer",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Globe,
      title: "Multi-langues",
      description: "Interface disponible en plusieurs langues",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: Lock,
      title: "Accès Sécurisé",
      description: "Authentification multi-facteurs et permissions granulaires",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Créer un ticket",
      description: "Signalez votre incident en quelques clics avec notre formulaire intuitif",
      icon: FileText,
    },
    {
      number: "02",
      title: "Assignation automatique",
      description: "Notre système assigne le technicien le plus qualifié en temps réel",
      icon: Zap,
    },
    {
      number: "03",
      title: "Traitement rapide",
      description: "Suivez l'avancement en direct et recevez des notifications à chaque étape",
      icon: Clock,
    },
    {
      number: "04",
      title: "Résolution validée",
      description: "Confirmez la résolution et laissez un avis pour améliorer nos services",
      icon: CheckCircle,
    },
  ];

  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Directrice Hôtel Ritz",
      content: "TicketHotel a transformé notre gestion de maintenance. L'efficacité est remarquable !",
      rating: 5,
      avatar: "SM",
    },
    {
      name: "Jean Dubois",
      role: "Manager Technique",
      content: "Interface intuitive et notifications en temps réel. Un outil indispensable pour notre équipe.",
      rating: 5,
      avatar: "JD",
    },
    {
      name: "Marie Laurent",
      role: "Responsable Qualité",
      content: "La rapidité de traitement et le suivi détaillé nous permettent d'exceller dans notre service client.",
      rating: 5,
      avatar: "ML",
    },
  ];

  const faqs = [
    {
      question: "Comment créer un ticket ?",
      answer: "C'est très simple ! Cliquez sur 'Créer un ticket', remplissez le formulaire avec les détails de l'incident, et notre système assignera automatiquement un technicien qualifié.",
    },
    {
      question: "Quel est le temps de réponse moyen ?",
      answer: "Notre temps de réponse moyen est inférieur à 2 heures. Les urgences critiques sont traitées en priorité dans les 30 minutes.",
    },
    {
      question: "Puis-je suivre l'avancement de mon ticket ?",
      answer: "Absolument ! Vous recevrez des notifications en temps réel à chaque étape et pouvez consulter le statut détaillé dans votre tableau de bord.",
    },
    {
      question: "Le système est-il sécurisé ?",
      answer: "Oui, nous respectons strictement le RGPD et utilisons un chiffrement de niveau bancaire pour protéger toutes vos données.",
    },
    {
      question: "Y a-t-il une application mobile ?",
      answer: "Notre interface web est entièrement responsive et optimisée pour mobile. Une application native est en développement.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      {/* Hero Section with Luxury Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with Parallax Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${luxuryBg})` }}
        />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        
        {/* Animated Light Rays */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-secondary rounded-full animate-ping opacity-75" />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-secondary rounded-full animate-ping opacity-75 delay-500" />
        <div className="absolute bottom-40 left-20 w-2.5 h-2.5 bg-secondary rounded-full animate-ping opacity-75 delay-1000" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/20 backdrop-blur-md border border-secondary/30 shadow-lg hover:bg-secondary/30 transition-all duration-300">
              <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
              <span className="text-sm font-semibold text-primary-foreground">Solution Premium</span>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1">
              {[...new Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="h-7 w-7 fill-secondary text-secondary drop-shadow-lg animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-primary-foreground drop-shadow-2xl">
            L'Excellence au Service
            <br />
            <span className="text-gradient-gold bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary drop-shadow-lg">
              de Votre Hôtel
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-primary-foreground/95 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-lg">
            Gestion professionnelle des incidents techniques pour les établissements d'exception
          </p>

          {/* Additional Info Cards */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <CheckCircle className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground">Résolution rapide</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Shield className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground">Sécurité garantie</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Award className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground">Service premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card/50 -mt-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center group"
                >
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Fonctionnalités Premium
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Une Expérience Premium
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des outils de gestion conçus pour répondre aux exigences des hôtels de luxe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-card p-6 rounded-xl shadow-lg border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`h-12 w-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2 text-card-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Un processus simple et efficace en 4 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connection lines for desktop */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative bg-card p-6 rounded-xl shadow-lg border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group text-center"
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {step.number.split("")[1]}
                    </div>
                  </div>
                  <div className="mt-4 mb-4 flex justify-center">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-serif font-semibold mb-2 text-card-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <MessageSquare className="h-4 w-4" />
              Témoignages
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez les retours de nos partenaires hôteliers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Section */}
      <section className="py-20 bg-gradient-luxury">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
              Espace Professionnel
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Accédez à votre tableau de bord personnalisé
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => navigate("/login")}
              className="group relative bg-gradient-to-br from-card/20 via-card/15 to-card/10 backdrop-blur-md border-2 border-primary-foreground/30 rounded-2xl p-8 text-center transition-all duration-500 hover:border-secondary/60 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-300">
                  <Users className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-primary-foreground font-semibold text-lg group-hover:text-secondary transition-colors duration-300">Client</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="group relative bg-gradient-to-br from-card/20 via-card/15 to-card/10 backdrop-blur-md border-2 border-primary-foreground/30 rounded-2xl p-8 text-center transition-all duration-500 hover:border-secondary/60 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-300">
                  <Building2 className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-primary-foreground font-semibold text-lg group-hover:text-secondary transition-colors duration-300">Technicien</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="group relative bg-gradient-to-br from-card/20 via-card/15 to-card/10 backdrop-blur-md border-2 border-primary-foreground/30 rounded-2xl p-8 text-center transition-all duration-500 hover:border-secondary/60 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-300">
                  <Hotel className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-primary-foreground font-semibold text-lg group-hover:text-secondary transition-colors duration-300">Admin Hôtel</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <HelpCircle className="h-4 w-4" />
              Questions fréquentes
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Besoin d'aide ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Award className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Prêt à transformer votre gestion de maintenance ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoignez des centaines d'hôtels qui font confiance à TicketHotel pour une gestion optimale de leurs incidents techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 shadow-lg"
                onClick={() => navigate("/create-ticket")}
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6"
                onClick={() => navigate("/login")}
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default Index;