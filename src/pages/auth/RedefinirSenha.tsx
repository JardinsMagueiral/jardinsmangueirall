import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, CheckCircle, XCircle } from "lucide-react";

const redefinirSenhaSchema = z.object({
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação deve ter no mínimo 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>;

export default function RedefinirSenha() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
  });

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasValidSession(!!session);
    };
    
    checkSession();

    // Listen for auth state changes (recovery link click)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: RedefinirSenhaFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({
          title: "Erro ao redefinir senha",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso",
      });

      // Redirect to account after 3 seconds
      setTimeout(() => {
        navigate("/minha-conta");
      }, 3000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao redefinir sua senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (hasValidSession === null) {
    return (
      <>
        <Helmet>
          <title>Redefinir Senha - Jardins Mangueiral</title>
        </Helmet>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex flex-1 items-center justify-center px-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // No valid session - invalid or expired link
  if (!hasValidSession) {
    return (
      <>
        <Helmet>
          <title>Link Inválido - Jardins Mangueiral</title>
        </Helmet>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex flex-1 items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 rounded-full bg-destructive/10 p-4">
                  <XCircle className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Link Inválido</CardTitle>
                <CardDescription>
                  O link de recuperação é inválido ou expirou
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                <p>
                  Links de recuperação de senha expiram após 1 hora. 
                  Solicite um novo link para redefinir sua senha.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link to="/esqueci-senha" className="w-full">
                  <Button className="w-full">
                    Solicitar novo link
                  </Button>
                </Link>
                <Link to="/login" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Voltar para login
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Redefinir Senha - Jardins Mangueiral</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {success ? "Senha Redefinida!" : "Nova Senha"}
              </CardTitle>
              <CardDescription>
                {success 
                  ? "Você será redirecionado em instantes..."
                  : "Digite sua nova senha"
                }
              </CardDescription>
            </CardHeader>

            {success ? (
              <CardContent className="flex flex-col items-center gap-4 py-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Sua senha foi alterada com sucesso. Você será redirecionado para sua conta.
                </p>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Redefinir Senha
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
}
