import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-8 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-sm font-mono text-primary">Powered by Aztec Network</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 terminal-glow">
            Private Payroll,
            <br />
            <span className="text-primary">Public Trust</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The first payroll platform built on private stablecoins. Pay your team with complete privacy and security.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/business">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                For Business
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/individual">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                For Individuals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-glow border-primary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Private Payments</h3>
              <p className="text-muted-foreground">
                All transactions are shielded using Aztec's zero-knowledge proofs for complete privacy.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-glow border-accent/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Settlements</h3>
              <p className="text-muted-foreground">
                Pay your team instantly with stablecoins. No waiting for bank transfers.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-glow border-secondary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Yield</h3>
              <p className="text-muted-foreground">
                Put idle payroll funds to work. Stake and earn competitive APY on your balance.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
