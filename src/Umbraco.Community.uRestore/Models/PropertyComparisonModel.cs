namespace Umbraco.Community.uRestore.Models
{
    /// <summary>
    /// Represents a comparison of a single property's value between the current draft
    /// and a historical version.
    /// </summary>
    public record PropertyComparisonModel
    {
        /// <summary>The property alias.</summary>
        public required string Alias { get; init; }

        /// <summary>The human-readable property name.</summary>
        public required string Label { get; init; }

        /// <summary>The property editor alias (e.g. Umbraco.TextBox, Umbraco.RichText).</summary>
        public required string EditorAlias { get; init; }

        /// <summary>
        /// The current draft value, serialised to a JSON string.
        /// Null if the property has no value.
        /// </summary>
        public string? CurrentValue { get; init; }

        /// <summary>
        /// The historical value from the target version, serialised to a JSON string.
        /// Null if the property had no value at that version.
        /// </summary>
        public string? HistoricalValue { get; init; }

        /// <summary>Whether the current and historical values differ.</summary>
        public required bool HasChanges { get; init; }

        /// <summary>The culture this comparison is for, or null for invariant properties.</summary>
        public string? Culture { get; init; }

        /// <summary>The segment this comparison is for, or null for unsegmented properties.</summary>
        public string? Segment { get; init; }
    }
}
