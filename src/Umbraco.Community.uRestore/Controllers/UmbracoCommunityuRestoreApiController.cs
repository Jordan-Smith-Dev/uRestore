using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Community.uRestore.Models;
using Umbraco.Community.uRestore.Services;

namespace Umbraco.Community.uRestore.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [MapToApi(Constants.ApiName)]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [ApiExplorerSettings(GroupName = Constants.ApiName)]
    [Route($"umbraco/{Constants.ApiName}/api/v{{version:apiVersion}}")]
    public class uRestoreApiController : Controller
    {
        private readonly PropertyRestoreService _propertyRestoreService;

        public uRestoreApiController(PropertyRestoreService propertyRestoreService)
        {
            _propertyRestoreService = propertyRestoreService;
        }

        /// <summary>
        /// Returns a property-by-property comparison between the current draft and
        /// the specified historical version.
        /// </summary>
        [HttpGet("content/{contentId:guid}/version/{versionId:guid}/properties")]
        [ProducesResponseType(typeof(IReadOnlyCollection<PropertyComparisonModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetVersionProperties(
            Guid contentId,
            Guid versionId,
            [FromQuery] string? culture = null)
        {
            var comparisons = await _propertyRestoreService.GetPropertyComparisonAsync(contentId, versionId, culture);
            return Ok(comparisons);
        }

        /// <summary>
        /// Restores the values of the specified properties from a historical version onto
        /// the current draft and saves it. The restored draft will not be automatically published.
        /// </summary>
        [HttpPost("content/{contentId:guid}/restore")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RestoreProperties(
            Guid contentId,
            [FromBody] PropertyRestoreRequest request)
        {
            if (request.PropertyAliases.Count == 0)
                return BadRequest("At least one property alias must be provided.");

            var success = await _propertyRestoreService.RestorePropertiesAsync(contentId, request);

            if (!success)
                return BadRequest("Restore failed. Verify that the content ID and version ID are correct.");

            return Ok();
        }
    }
}
