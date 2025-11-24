using Blazor.Extensions;
using Blazor.Extensions.Canvas.Canvas2D;
using BouncingKFLogo.Core;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace BouncingKFLogo.Pages
{
    public partial class Home
    {
        private P5Interop? _p5;
        private bool _initialized = false;

        [Inject]
        public IJSRuntime JS { get; set; } = default!;

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                _p5 = new P5Interop(JS);
                await _p5.InitializeAsync();


                // start the sketch
                // image path can be relative to wwwroot, e.g. "images/dvd_logo.png"
                await _p5.StartAsync("dvd-container", "images/dvd_logo.png", 0, 0);


                _initialized = true;
            }
        }

        public async ValueTask DisposeAsync()
        {
            if (_p5 != null)
            {
                await _p5.DisposeAsync();
            }
        }
    }
}
