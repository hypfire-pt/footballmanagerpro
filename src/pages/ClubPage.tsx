import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  MapPin, 
  Users, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Building,
  GraduationCap,
  Dumbbell,
  Award,
  Target,
  Shield
} from "lucide-react";
import { europeanTeams } from "@/data/teams";

const ClubPage = () => {
  // Get Manchester City as user's club
  const userClub = europeanTeams.find(team => team.id === "man-city")!;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  const getReputationLabel = (reputation: number) => {
    if (reputation >= 95) return "World Class";
    if (reputation >= 90) return "Elite";
    if (reputation >= 85) return "International";
    if (reputation >= 80) return "Continental";
    return "National";
  };

  // Mock data for facilities and staff
  const facilities = {
    trainingGround: { name: "City Football Academy", rating: 20, maxRating: 20 },
    youthAcademy: { name: "Academy Stadium", rating: 18, maxRating: 20 },
    medicalFacility: { name: "Sports Science Centre", rating: 19, maxRating: 20 },
    scouting: { name: "Global Scouting Network", rating: 20, maxRating: 20 },
  };

  const staff = [
    { role: "Manager", name: "Pep Guardiola", rating: 95, contract: "2025" },
    { role: "Assistant Manager", name: "Juanma Lillo", rating: 88, contract: "2025" },
    { role: "First Team Coach", name: "Rodolfo Borrell", rating: 85, contract: "2024" },
    { role: "Goalkeeping Coach", name: "Xabier Mancisidor", rating: 87, contract: "2024" },
    { role: "Head of Recruitment", name: "Joe Shields", rating: 82, contract: "2026" },
    { role: "Chief Scout", name: "Gary Worthington", rating: 84, contract: "2025" },
  ];

  const achievements = [
    { year: "2022/23", trophy: "Premier League Champion" },
    { year: "2022/23", trophy: "FA Cup Winner" },
    { year: "2022/23", trophy: "UEFA Champions League Winner" },
    { year: "2021/22", trophy: "Premier League Champion" },
    { year: "2020/21", trophy: "Premier League Champion" },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Club Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-background border">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Club Badge */}
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${userClub.colors.primary}, ${userClub.colors.secondary})`
                }}
              >
                <span className="text-white">{userClub.shortName.substring(0, 3).toUpperCase()}</span>
              </div>

              {/* Club Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{userClub.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{userClub.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {userClub.founded}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{userClub.stadium}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    {getReputationLabel(userClub.reputation)}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Reputation: {userClub.reputation}/100
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Budget: {formatCurrency(userClub.finances)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stadium Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Stadium Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Stadium Name</span>
                      <span className="font-semibold">{userClub.stadium}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <span className="font-semibold">{userClub.capacity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Average Attendance</span>
                      <span className="font-semibold">{Math.floor(userClub.capacity * 0.96).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Attendance Rate</span>
                      <Badge variant="secondary">96%</Badge>
                    </div>
                  </div>
                  <Progress value={96} className="h-2" />
                </CardContent>
              </Card>

              {/* Club Reputation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Club Reputation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Global Reputation</span>
                      <span className="font-semibold">{userClub.reputation}/100</span>
                    </div>
                    <Progress value={userClub.reputation} className="h-2 mb-4" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Domestic Standing</span>
                      <Badge variant="secondary">Elite</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">European Prestige</span>
                      <Badge variant="secondary">World Class</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Youth Development</span>
                      <Badge variant="secondary">Excellent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(userClub.finances)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transfer Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(userClub.finances * 0.6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Wage Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(userClub.finances * 0.3)}/week</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Financial Health</p>
                    <Badge variant="secondary" className="text-lg mt-1">Excellent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Training Ground
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{facilities.trainingGround.name}</span>
                        <Badge variant="secondary">
                          {facilities.trainingGround.rating}/{facilities.trainingGround.maxRating}
                        </Badge>
                      </div>
                      <Progress value={(facilities.trainingGround.rating / facilities.trainingGround.maxRating) * 100} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      State-of-the-art training facilities with 16.5 acres of training pitches and comprehensive sports science facilities.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Youth Academy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{facilities.youthAcademy.name}</span>
                        <Badge variant="secondary">
                          {facilities.youthAcademy.rating}/{facilities.youthAcademy.maxRating}
                        </Badge>
                      </div>
                      <Progress value={(facilities.youthAcademy.rating / facilities.youthAcademy.maxRating) * 100} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      World-class youth development system producing top-tier talent with excellent coaching and facilities.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Medical Facility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{facilities.medicalFacility.name}</span>
                        <Badge variant="secondary">
                          {facilities.medicalFacility.rating}/{facilities.medicalFacility.maxRating}
                        </Badge>
                      </div>
                      <Progress value={(facilities.medicalFacility.rating / facilities.medicalFacility.maxRating) * 100} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Advanced medical and recovery facilities ensuring optimal player health and injury prevention.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Scouting Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{facilities.scouting.name}</span>
                        <Badge variant="secondary">
                          {facilities.scouting.rating}/{facilities.scouting.maxRating}
                        </Badge>
                      </div>
                      <Progress value={(facilities.scouting.rating / facilities.scouting.maxRating) * 100} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive global scouting network identifying talent across all continents and age groups.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coaching & Management Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Contract Until</p>
                          <p className="font-semibold">{member.contract}</p>
                        </div>
                        <div className="text-center">
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            {member.rating}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Rating</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{achievement.trophy}</p>
                        <p className="text-sm text-muted-foreground">{achievement.year}</p>
                      </div>
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Winner
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Club Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">UEFA Champions League Triumph</p>
                      <p className="text-sm text-muted-foreground">First European Cup win in club history (2023)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Treble Winners</p>
                      <p className="text-sm text-muted-foreground">Premier League, FA Cup, and Champions League in one season</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Record Points Total</p>
                      <p className="text-sm text-muted-foreground">100 points in Premier League season (2017/18)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClubPage;
