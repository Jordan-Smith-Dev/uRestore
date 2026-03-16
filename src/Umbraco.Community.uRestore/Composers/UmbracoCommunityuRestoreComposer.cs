using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.uRestore.Services;

namespace Umbraco.Community.uRestore.Composers
{
    public class uRestoreComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddScoped<PropertyRestoreService>();
        }
    }
}
