namespace Umbraco.Community.uRestore.Models
{
    /// <summary>
    /// Represents metadata about a single saved version of a content node.
    /// </summary>
    public record ContentVersionModel
    {
        /// <summary>The unique key of this version.</summary>
        public required Guid VersionId { get; init; }

        /// <summary>The date and time this version was saved.</summary>
        public required DateTime CreateDate { get; init; }

        /// <summary>The display name of the user who saved this version, if available.</summary>
        public string? CreatedByName { get; init; }

        /// <summary>Whether this is the current draft version.</summary>
        public required bool IsCurrentDraft { get; init; }

        /// <summary>Whether this is the current published version.</summary>
        public required bool IsCurrentPublished { get; init; }

        /// <summary>Whether this version is pinned to prevent automatic cleanup.</summary>
        public required bool PreventCleanup { get; init; }
    }
}
