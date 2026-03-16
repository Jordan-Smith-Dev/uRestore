namespace Umbraco.Community.uRestore.Models
{
    /// <summary>
    /// Describes a request to restore selected property values from a historical version
    /// onto the current draft.
    /// </summary>
    public record PropertyRestoreRequest
    {
        /// <summary>The unique key of the historical version to restore from.</summary>
        public required Guid VersionId { get; init; }

        /// <summary>
        /// The aliases of the properties to restore.
        /// Only properties in this list will be modified; all others remain unchanged.
        /// </summary>
        public required IReadOnlyCollection<string> PropertyAliases { get; init; }

        /// <summary>
        /// The culture to restore, or null to restore invariant values.
        /// Culture-variant properties will only have their specified culture restored.
        /// </summary>
        public string? Culture { get; init; }
    }
}
