import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Wallet, Building2, TrendingUp, FileCheck, DollarSign, Globe, Lock, Coins } from "lucide-react";
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
            Your Salary,
            <br />
            <span className="text-primary">Your Control</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Proof of employment. Salary advances. Private payroll. All onchain with complete privacy.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary/20">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* For Employees Section */}
      <section className="px-8 py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Employees</h2>
            <p className="text-muted-foreground text-lg">Take control of your financial future</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-glow border-primary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Proof of Employment</h3>
              <p className="text-sm text-muted-foreground">
                Generate verified proof of employment without revealing sensitive salary data
              </p>
            </Card>

            <Card className="p-6 bg-gradient-glow border-accent/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Proof of Salary</h3>
              <p className="text-sm text-muted-foreground">
                Prove your income level privately using zero-knowledge proofs
              </p>
            </Card>

            <Card className="p-6 bg-gradient-glow border-secondary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Borrow Against Salary</h3>
              <p className="text-sm text-muted-foreground">
                Access instant loans by pledging a percentage of your future income
              </p>
            </Card>

            <Card className="p-6 bg-gradient-glow border-primary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Withdrawals</h3>
              <p className="text-sm text-muted-foreground">
                Withdraw to your bank account or any blockchain network instantly
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Businesses</h2>
            <p className="text-muted-foreground text-lg">Modern payroll for the onchain economy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-glow border-primary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Private Payroll from Ethereum</h3>
              <p className="text-muted-foreground">
                Execute payroll onchain with complete privacy. Pay from Ethereum, receive privately on Aztec.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-glow border-accent/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Any Token, Any Currency</h3>
              <p className="text-muted-foreground">
                Support for USDC, USDT, eEUR, tGBP and more. Pay your global team in their preferred currency.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-glow border-secondary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Made Easy</h3>
              <p className="text-muted-foreground">
                Maintain employee privacy while keeping transparent records for audits and compliance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* For Lenders Section */}
      <section className="px-8 py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Lenders</h2>
            <p className="text-muted-foreground text-lg">Secure lending backed by verifiable income</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-glow border-primary/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Income Pledges</h3>
              <p className="text-muted-foreground mb-4">
                Lend to employees with confidence. Their salary pledges are enforced automatically via smart contracts.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Automatic deductions from payroll
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Priority-based payment system
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Zero default risk from employer
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-glow border-accent/20 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Competitive Returns</h3>
              <p className="text-muted-foreground mb-4">
                Offer salary advances and earn interest. Lower risk than traditional lending with built-in repayment.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Predictable monthly payments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Transparent credit assessment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Trustless enforcement
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-sm font-mono text-primary">Join the Future of Payroll</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Connect your wallet and experience private, flexible payroll today.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
              Connect Wallet & Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
