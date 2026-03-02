import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import QuemSomos from "./pages/QuemSomos";
import Imoveis from "./pages/Imoveis";
import ImovelDetalhe from "./pages/ImovelDetalhe";
import Noticias from "./pages/Noticias";
import Parceiros from "./pages/Parceiros";
import Grupos from "./pages/Grupos";
import Eventos from "./pages/Eventos";
import Calculadoras from "./pages/Calculadoras";
import Contato from "./pages/Contato";
import Classificados from "./pages/Classificados";
import ClassificadoDetalhe from "./pages/ClassificadoDetalhe";
import ClassificadoNovo from "./pages/ClassificadoNovo";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import EsqueciSenha from "./pages/auth/EsqueciSenha";
import RedefinirSenha from "./pages/auth/RedefinirSenha";

// Client pages
import MinhaConta from "./pages/cliente/MinhaConta";
import NovoImovel from "./pages/cliente/NovoImovel";
import EditarImovel from "./pages/cliente/EditarImovel";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminImoveis from "./pages/admin/AdminImoveis";
import AdminNovoImovel from "./pages/admin/AdminNovoImovel";
import AdminEditarImovel from "./pages/admin/AdminEditarImovel";
import AdminEventos from "./pages/admin/AdminEventos";
import AdminParceiros from "./pages/admin/AdminParceiros";
import AdminClientes from "./pages/admin/AdminClientes";
import AdminClassificados from "./pages/admin/AdminClassificados";
import AdminGrupos from "./pages/admin/AdminGrupos";
import AdminQuadras from "./pages/admin/AdminQuadras";
import AdminNoticias from "./pages/admin/AdminNoticias";
import QuadraDetalhe from "./pages/QuadraDetalhe";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/quadra/:numero" element={<QuadraDetalhe />} />
              <Route path="/quem-somos" element={<QuemSomos />} />
              <Route path="/imoveis" element={<Imoveis />} />
              <Route path="/imoveis/:id" element={<ImovelDetalhe />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/parceiros" element={<Parceiros />} />
              <Route path="/grupos" element={<Grupos />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/calculadoras" element={<Calculadoras />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/classificados" element={<Classificados />} />
              <Route path="/classificados/:id" element={<ClassificadoDetalhe />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />

              {/* Client routes (protected) */}
              <Route
                path="/minha-conta"
                element={
                  <ProtectedRoute>
                    <MinhaConta />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minha-conta/novo-imovel"
                element={
                  <ProtectedRoute>
                    <NovoImovel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minha-conta/editar-imovel/:id"
                element={
                  <ProtectedRoute>
                    <EditarImovel />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes (protected + admin required) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/imoveis"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminImoveis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/novo-imovel"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminNovoImovel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/imoveis/:id/editar"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminEditarImovel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/eventos"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminEventos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/parceiros"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminParceiros />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clientes"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminClientes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/classificados/novo"
                element={
                  <ProtectedRoute>
                    <ClassificadoNovo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classificados"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminClassificados />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/grupos"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminGrupos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/quadras"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminQuadras />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/noticias"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminNoticias />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
