using System.Text.Json;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.uRestore.Models;

namespace Umbraco.Community.uRestore.Services
{
    /// <summary>
    /// Provides methods for comparing content versions at the property level
    /// and selectively restoring individual properties from a historical version.
    /// </summary>
    public class PropertyRestoreService
    {
        private readonly IContentService _contentService;
        private readonly IContentVersionService _contentVersionService;

        public PropertyRestoreService(
            IContentService contentService,
            IContentVersionService contentVersionService)
        {
            _contentService = contentService;
            _contentVersionService = contentVersionService;
        }

        /// <summary>
        /// Returns a property-by-property comparison between the current draft and
        /// the specified historical version.
        /// </summary>
        public async Task<IReadOnlyCollection<PropertyComparisonModel>> GetPropertyComparisonAsync(
            Guid contentKey,
            Guid versionId,
            string? culture)
        {
            var versionAttempt = await _contentVersionService.GetAsync(versionId);
            if (!versionAttempt.Success || versionAttempt.Result is null)
                return Array.Empty<PropertyComparisonModel>();

            var historicalContent = versionAttempt.Result;
            var currentContent = _contentService.GetById(contentKey);

            if (currentContent is null)
                return Array.Empty<PropertyComparisonModel>();

            var comparisons = new List<PropertyComparisonModel>();

            foreach (var property in currentContent.Properties)
            {
                var historicalProperty = historicalContent.Properties.FirstOrDefault(p => p.Alias == property.Alias);
                if (historicalProperty is null)
                    continue;

                var currentValue = SerialisePropertyValue(property.GetValue(culture));
                var historicalValue = SerialisePropertyValue(historicalProperty.GetValue(culture));

                comparisons.Add(new PropertyComparisonModel
                {
                    Alias = property.Alias,
                    Label = property.PropertyType.Name,
                    EditorAlias = property.PropertyType.PropertyEditorAlias,
                    CurrentValue = currentValue,
                    HistoricalValue = historicalValue,
                    HasChanges = currentValue != historicalValue,
                    Culture = culture,
                    Segment = null,
                });
            }

            // Sort: changed properties first, then alphabetically by label
            return comparisons
                .OrderByDescending(p => p.HasChanges)
                .ThenBy(p => p.Label)
                .ToList();
        }

        /// <summary>
        /// Copies the values of the specified properties from a historical version onto
        /// the current draft, then saves the draft.
        /// </summary>
        /// <returns>True if the save succeeded; false otherwise.</returns>
        public async Task<bool> RestorePropertiesAsync(
            Guid contentKey,
            PropertyRestoreRequest request)
        {
            var versionAttempt = await _contentVersionService.GetAsync(request.VersionId);
            if (!versionAttempt.Success || versionAttempt.Result is null)
                return false;

            var historicalContent = versionAttempt.Result;
            var currentContent = _contentService.GetById(contentKey);

            if (currentContent is null)
                return false;

            foreach (var alias in request.PropertyAliases)
            {
                var historicalProperty = historicalContent.Properties.FirstOrDefault(p => p.Alias == alias);
                if (historicalProperty is null)
                    continue;

                var value = historicalProperty.GetValue(request.Culture);
                currentContent.SetValue(alias, value, request.Culture);
            }

            var saveResult = _contentService.Save(currentContent, -1);
            return saveResult.Success;
        }

        private static string? SerialisePropertyValue(object? value)
        {
            if (value is null) return null;
            if (value is string str) return str;
            return JsonSerializer.Serialize(value);
        }
    }
}
