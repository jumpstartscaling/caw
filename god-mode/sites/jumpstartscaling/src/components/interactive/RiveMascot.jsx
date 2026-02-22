import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export default function RiveMascot() {
    const { RiveComponent } = useRive({
        src: '/animations/vehicles.riv',
        layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
        autoplay: true,
    });

    return (
        <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-gray-800 bg-gray-900 mx-auto">
            <RiveComponent />
        </div>
    );
}
