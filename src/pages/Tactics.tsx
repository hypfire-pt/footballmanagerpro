import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

const Tactics = () => {
  const positions = [
    { id: "gk", top: "85%", left: "50%" },
    { id: "lb", top: "70%", left: "20%" },
    { id: "cb1", top: "70%", left: "40%" },
    { id: "cb2", top: "70%", left: "60%" },
    { id: "rb", top: "70%", left: "80%" },
    { id: "cm1", top: "50%", left: "35%" },
    { id: "cm2", top: "50%", left: "65%" },
    { id: "lw", top: "30%", left: "25%" },
    { id: "cam", top: "35%", left: "50%" },
    { id: "rw", top: "30%", left: "75%" },
    { id: "st", top: "15%", left: "50%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tactics</h1>
            <p className="text-muted-foreground">
              Set your formation and tactical instructions
            </p>
          </div>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Tactics
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-4">
                <Badge className="bg-pitch-green/20 text-pitch-green">
                  4-2-3-1
                </Badge>
              </div>
              
              <div
                className="relative w-full rounded-lg overflow-hidden"
                style={{
                  aspectRatio: "2/3",
                  background: "linear-gradient(180deg, hsl(var(--pitch-dark)) 0%, hsl(var(--pitch-green)) 50%, hsl(var(--pitch-dark)) 100%)",
                }}
              >
                {/* Pitch markings */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/30" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-8 border-2 border-white/30" />
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/30" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/30" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-8 border-2 border-white/30" />
                </div>

                {/* Players */}
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-xs font-bold text-white">
                        {pos.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Formation</h3>
              <Select defaultValue="4-2-3-1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-4-2">4-4-2</SelectItem>
                  <SelectItem value="4-3-3">4-3-3</SelectItem>
                  <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                  <SelectItem value="3-5-2">3-5-2</SelectItem>
                  <SelectItem value="5-3-2">5-3-2</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Team Instructions</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Mentality
                  </label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defensive">Defensive</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="attacking">Attacking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tempo
                  </label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Width
                  </label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="narrow">Narrow</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Pressing
                  </label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tactics;
