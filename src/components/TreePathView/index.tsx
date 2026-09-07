import FormViewPath from './FormView';
import { useEffect, useRef, useState } from 'react';

interface TreePathViewProps {
    visible:boolean
}

const sleep = (ms:number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export default function TreePathView(props: TreePathViewProps) {

    const [doAnimation, setDoAnimation] = useState(false);
    const [doAnimationFirstCircle, setDoAnimationFirstCircle] = useState(false);
    const [doAnimationSecondCircle, setDoAnimationSecondCircle] = useState(false);
    const [doAnimationThirdCircle, setDoAnimationThirdCircle] = useState(false);
    const [doAnimationFourCircle, setDoAnimationFourCircle] = useState(false);


    const principalPath = useRef<HTMLDivElement | null>(null);(null);
    const delayedFunction = async () => {
        await sleep(2000);
        setDoAnimation(props.visible)
    }


    useEffect(() => {
        if(props.visible){
            delayedFunction()

        }else{
            setDoAnimation(false)
        }
    }, [props.visible])


    useEffect(() => {
        if(doAnimation){
            const interval = setInterval(() => {
                if (principalPath.current) {
                    const height = principalPath.current.clientHeight;
                    if(height >= 91 && height <= 94){
                        console.log("entrou")
                        setDoAnimationFirstCircle(true)
                    }
                    if(height >= 284 && height <= 286){
                        setDoAnimationSecondCircle(true)
                    }
                    if(height >= 520 && height <= 526){
                        setDoAnimationThirdCircle(true)
                    }
                    if(height >= 699 && height <= 701){
                        setDoAnimationFourCircle(true)
                    }
    
                }
            }, 14.28);
            return () => clearInterval(interval);
        }else{
            setDoAnimationFirstCircle(false)
            setDoAnimationSecondCircle(false)
            setDoAnimationThirdCircle(false)
            setDoAnimationFourCircle(false)
        }
        
        
    }, [doAnimation])

    return (
        <div className='max-[1000px]:text-[14px]'>
            <div ref={principalPath} className={`absolute w-[5px] bg-[#0D0D0D] ${doAnimation ? 'fade-path' : ''}`} ></div>
            <div className={`max-[1000px]:text-[14px] absolute text-[20px] mont-real-font translate-x-[20px]`}>October, 2017</div>
            <div className={`max-[1000px]:text-[14px] absolute w-[20px] h-[20px] bg-[#0D0D0D] rounded-[20px] translate-x-[-7px] translate-y-[93px] ${doAnimationFirstCircle ? 'fade-dates-path' : 'hidden'}`}></div>
            <div className={`max-[1000px]:text-[14px] absolute text-[20px] mont-real-font translate-y-[89px] translate-x-[25px] ${doAnimationFirstCircle ? 'fade-dates-path' : 'hidden'}`}>June, 2020</div>
            <div className={`max-[1000px]:text-[14px] absolute w-[20px] h-[20px] bg-[#0D0D0D] rounded-[20px] translate-x-[-7px] translate-y-[285px] ${doAnimationSecondCircle ? 'fade-dates-path' : 'hidden'}`}></div>
            <div className={`max-[1000px]:text-[14px] absolute text-[20px] mont-real-font translate-y-[280px] translate-x-[-120px] ${doAnimationSecondCircle ? 'fade-dates-path' : 'hidden'}`}>July, 2023</div>
            <div className={`max-[1000px]:text-[14px] absolute w-[20px] h-[20px] bg-[#0D0D0D] rounded-[20px] translate-x-[-7px] translate-y-[525px] ${doAnimationThirdCircle ? 'fade-dates-path' : 'hidden'}`}></div>
            <div className={`max-[1000px]:text-[14px] absolute text-[20px] mont-real-font translate-y-[520px] translate-x-[25px] ${doAnimationThirdCircle ? 'fade-dates-path' : 'hidden'}`}>September, 2023</div>
            <div className={`max-[1000px]:text-[14px] absolute text-[20px] mont-real-font translate-y-[700px] translate-x-[25px] ${doAnimationFourCircle ? 'fade-dates-path' : 'hidden'}`}>Soon?</div>
                <div className={`absolute translate-x-[-110%] translate-y-[89px] ${doAnimationFirstCircle ? 'fade-dates-path' : 'hidden'}`}>
                    <FormViewPath 
                        title='High School'
                        subtitle='Escola Secundária de Paredes'
                        tag='Academic'
                    />
                </div>
                <div className={`absolute translate-x-[10%] translate-y-[280px] ${doAnimationSecondCircle ? 'fade-dates-path' : 'hidden'}`}>
                    <FormViewPath 
                        title='Computer Engineering'
                        subtitle='Trás os Montes e Alto Douro University'
                        tag='Academic'
                        desc={[
                            'Web development in C#, ASP.NET MVC and .NET;',
                            'Data Science with Python;',
                            'System Operation with C, Bash and Linux;',
                            'SQL with SQL Server'
                        ]}
                    />
                </div>
                <div className={`absolute translate-x-[-110%] translate-y-[520px] ${doAnimationThirdCircle ? 'fade-dates-path' : 'hidden'}`}>
                    <FormViewPath
                        title='Full Stack Developer'
                        subtitle='ANO Software'
                        tag='Professional'
                        desc={[
                            'Develop and maintain FutureERP-R3, an enterprise ERP platform built with Python and PostgreSQL;',
                            'Contribute to FutureERP-R4, a new ERP platform built from scratch with Java, Spring Boot, Hibernate, React and TypeScript;',
                            'Design and implement authentication with Keycloak and OAuth2, enabling Single Sign-On across both platforms;',
                            'Build Docker images and Compose configurations and prepare deployments to Linux-based client environments;'
                        ]}
                    />
                </div>
        </div>
    )
}
