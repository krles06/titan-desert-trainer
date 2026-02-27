import { ChevronLeft, Shield, FileText, Info, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Legal() {
    const navigate = useNavigate()

    const sections = [
        {
            id: 'aviso-legal',
            title: 'Aviso Legal',
            icon: Info,
            content: (
                <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                    <p>
                        <strong>Dunr</strong> es una plataforma digital diseñada para la generación automatizada de planes de entrenamiento ciclista mediante el uso de Inteligencia Artificial (IA).
                    </p>
                    <p>
                        Los planes generados por Dunr son de carácter meramente <strong>orientativo</strong> y están basados en la información proporcionada por el usuario. En ningún caso sustituyen el consejo, supervisión o prescripción de un entrenador profesional, médico o especialista deportivo.
                    </p>
                    <p>
                        Recomendamos encarecidamente someterse a un chequeo médico antes de iniciar cualquier programa de entrenamiento intenso.
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-dunr-blue">
                        <Mail size={14} />
                        <span className="font-bold">soporte@dunr.app</span>
                    </div>
                </div>
            )
        },
        {
            id: 'privacidad',
            title: 'Política de Privacidad',
            icon: Shield,
            content: (
                <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                    <p>
                        En Dunr nos tomamos muy en serio tu privacidad. Recogemos exclusivamente los datos necesarios para personalizar tu experiencia:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Datos de perfil:</strong> Edad, peso, altura y nivel de experiencia.</li>
                        <li><strong>Preferencias:</strong> Días disponibles y objetivos de entrenamiento.</li>
                    </ul>
                    <p>
                        Estos datos se utilizan únicamente para procesar tu plan de entrenamiento. No vendemos ni cedemos tus datos a terceros con fines comerciales.
                    </p>
                    <p>
                        Usamos infraestructura de terceros de confianza: <strong>Supabase</strong> para el almacenamiento seguro de datos y <strong>OpenAI</strong> para el procesamiento inteligente de los planes.
                    </p>
                    <p>
                        Cumplimos con el <strong>RGPD</strong> europeo. Puedes solicitar la eliminación total de tu cuenta y tus datos en cualquier momento enviando un correo a nuestra dirección de contacto.
                    </p>
                </div>
            )
        },
        {
            id: 'terminos',
            title: 'Términos y Condiciones',
            icon: FileText,
            content: (
                <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                    <p>
                        El acceso a las funcionalidades Premium de Dunr tiene un coste de <strong>15€ al mes</strong>. La suscripción se puede cancelar en cualquier momento desde tu perfil, sin permanencia.
                    </p>
                    <p>
                        Al usar Dunr, aceptas que los entrenamientos son sugerencias de una IA y que el usuario es el único responsable de su ejecución. <strong>Dunr no se responsabiliza de lesiones</strong>, daños o perjuicios derivados de seguir los planes propuestos.
                    </p>
                    <p>
                        El servicio está dirigido exclusivamente a <strong>mayores de 18 años</strong> y se presta íntegramente en español.
                    </p>
                </div>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-dunr-black pb-20">
            {/* Header */}
            <div className="gradient-dark px-4 pt-10 pb-12 border-b border-white/5">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
                    </button>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Información Legal</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mt-2">Transparencia y Seguridad</p>
                </div>
            </div>

            <div className="px-4 py-8 max-w-lg mx-auto space-y-8">
                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="glass-card p-6 animate-fade-in border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-dunr-blue/10 flex items-center justify-center text-dunr-blue">
                                <section.icon size={20} />
                            </div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">{section.title}</h2>
                        </div>
                        {section.content}
                    </section>
                ))}

                <div className="text-center pt-8 opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">DUNR TRAINER © 2026</p>
                </div>
            </div>
        </div>
    )
}
