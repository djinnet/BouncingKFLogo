using Microsoft.JSInterop;

namespace BouncingKFLogo.Core
{
    public class P5Interop : IAsyncDisposable
    {
        private readonly IJSRuntime _js;
        private IJSObjectReference? _module;

        public P5Interop(IJSRuntime js)
        {
            _js = js;
        }

        /// <summary>
        /// Loads the JS module (ES module) which contains the p5 integration code.
        /// Call once (for example in OnAfterRenderAsync when firstRender).
        /// </summary>
        public async Task InitializeAsync()
        {
            // Adjust the path to match where you serve p5Interop.js as a static asset.
            // If you put p5Interop.js in wwwroot/_content/YourAssemblyName/ then the import below is fine.
            _module = await _js.InvokeAsync<IJSObjectReference>("import", "./_content/BouncingKFLogo/p5Interop.js");
        }

        /// <summary>
        /// Start the DVD logo sketch inside the element with id elementId.
        /// imageUrl can be a relative URL (wwwroot) or external URL.
        /// width/height are optional — pass 0 to use container size.
        /// </summary>
        public async Task StartAsync(string elementId, string imageUrl, int width = 0, int height = 0)
        {
            if (_module == null) throw new InvalidOperationException("P5Interop not initialized. Call InitializeAsync first.");
            await _module.InvokeVoidAsync("startDVDSketch", elementId, imageUrl, width, height);
        }

        public async Task SetSpeedAsync(double multiplier)
        {
            if (_module == null) throw new InvalidOperationException("P5Interop not initialized. Call InitializeAsync first.");
            await _module.InvokeVoidAsync("setSpeed", multiplier);
        }

        public async Task SetColorCycleAsync(bool enable)
        {
            if (_module == null) throw new InvalidOperationException("P5Interop not initialized. Call InitializeAsync first.");
            await _module.InvokeVoidAsync("setColorCycle", enable);
        }

        /// <summary>
        /// Stops and disposes the sketch.
        /// </summary>
        public async Task StopAsync()
        {
            if (_module == null) return;
            await _module.InvokeVoidAsync("stopDVDSketch");
        }

        public async ValueTask DisposeAsync()
        {
            if (_module != null)
            {
                try
                {
                    await _module.InvokeVoidAsync("stopDVDSketch");
                }
                catch { }


                await _module.DisposeAsync();
            }
        }
    }
}
