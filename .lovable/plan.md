

## Plano: Slideshow Dinâmico no Hero da Página Inicial

### Objetivo

Fazer com que a imagem de fundo da seção hero alterne automaticamente entre 3 fotos da comunidade Jardins Mangueiral, com transições suaves e não muito rápidas.

### Comportamento Esperado

```text
Imagem 1 (atual) ──[fade 8s]──> Imagem 2 ──[fade 8s]──> Imagem 3 ──[fade 8s]──> Imagem 1...
```

- **Intervalo**: 8 segundos por imagem (pode ser ajustado)
- **Transição**: Fade suave de 1 segundo
- **Loop**: Infinito, retornando à primeira imagem após a última

### Mudanças Necessárias

#### 1. Copiar Imagens para o Projeto

Salvar as duas novas imagens na pasta `src/assets`:
- `src/assets/hero-bg-2.jpg` - Vista panorâmica com céu azul
- `src/assets/hero-bg-3.png` - Vista com sol poente

#### 2. Modificar HeroSection.tsx

Adicionar lógica de slideshow com React:

```typescript
// Imports das 3 imagens
import heroBg1 from "@/assets/hero-bg.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.png";

const heroImages = [heroBg1, heroBg2, heroBg3];

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 8000); // 8 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Images com transição */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000
            ${index === currentImage ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      
      {/* Overlay gradient (mantido) */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-background" />
      
      {/* Content (inalterado) */}
      ...
    </section>
  );
}
```

### Detalhes Técnicos

| Aspecto | Valor |
|---------|-------|
| Intervalo entre imagens | 8 segundos |
| Duração da transição | 1 segundo (fade) |
| Número de imagens | 3 |
| Técnica | Múltiplas divs sobrepostas com opacity toggle |

### Estrutura Visual

```text
┌─────────────────────────────────────────┐
│  [Imagem 1] opacity: 1                  │
│  [Imagem 2] opacity: 0                  │ ← Todas empilhadas
│  [Imagem 3] opacity: 0                  │
│  [Gradient Overlay]                     │
│  [Conteúdo: Título + Busca]             │
└─────────────────────────────────────────┘

        ↓ Após 8 segundos ↓

┌─────────────────────────────────────────┐
│  [Imagem 1] opacity: 0                  │
│  [Imagem 2] opacity: 1                  │ ← Imagem 2 visível
│  [Imagem 3] opacity: 0                  │
│  [Gradient Overlay]                     │
│  [Conteúdo: Título + Busca]             │
└─────────────────────────────────────────┘
```

### Arquivos a Criar/Copiar

1. `src/assets/hero-bg-2.jpg` - Copiar imagem enviada (vista panorâmica)
2. `src/assets/hero-bg-3.png` - Copiar imagem enviada (sol poente)

### Arquivos a Modificar

1. `src/components/HeroSection.tsx` - Adicionar lógica de slideshow

### Experiência do Usuário

- As imagens alternam de forma suave e elegante
- O intervalo de 8 segundos permite que o usuário aprecie cada foto
- A transição fade de 1 segundo é sutil e não distrai
- O conteúdo (título, botões, busca) permanece estático e legível
- O gradient overlay garante contraste adequado em todas as imagens

