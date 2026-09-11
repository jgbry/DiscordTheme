<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Services\Servers\ReinstallServerService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Pterodactyl\Http\Requests\Api\Client\Servers\Settings\RenameServerRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Settings\SetDockerImageRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Settings\ReinstallServerRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Settings\UpdateServerIconRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Settings\DeleteServerIconRequest;

class SettingsController extends ClientApiController
{
    /**
     * SettingsController constructor.
     */
    public function __construct(
        private ServerRepository $repository,
        private ReinstallServerService $reinstallServerService,
    ) {
        parent::__construct();
    }

    /**
     * Renames a server.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function rename(RenameServerRequest $request, Server $server): JsonResponse
    {
        $name = $request->input('name');
        $description = $request->has('description') ? (string) $request->input('description') : $server->description;
        $this->repository->update($server->id, [
            'name' => $name,
            'description' => $description,
        ]);

        if ($server->name !== $name) {
            Activity::event('server:settings.rename')
                ->property(['old' => $server->name, 'new' => $name])
                ->log();
        }

        if ($server->description !== $description) {
            Activity::event('server:settings.description')
                ->property(['old' => $server->description, 'new' => $description])
                ->log();
        }

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }

    /**
     * Upload a custom icon displayed on the client server rail.
     */
    public function updateIcon(UpdateServerIconRequest $request, Server $server): JsonResponse
    {
        $file = $request->file('icon');
        if (!$file) {
            throw new BadRequestHttpException('No icon file was provided.');
        }

        $this->deleteStoredIcon($server);

        $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
        $path = $file->storeAs('server-icons', $server->uuid . '.' . $extension, 'public');
        $icon = '/storage/' . $path;

        $this->repository->update($server->id, ['icon' => $icon]);

        Activity::event('server:settings.icon')
            ->property(['icon' => $icon])
            ->log();

        return new JsonResponse([
            'object' => 'server_icon',
            'attributes' => [
                'icon' => $icon,
            ],
        ]);
    }

    /**
     * Remove the custom server icon.
     */
    public function deleteIcon(DeleteServerIconRequest $request, Server $server): JsonResponse
    {
        $this->deleteStoredIcon($server);
        $this->repository->update($server->id, ['icon' => null]);

        Activity::event('server:settings.icon')
            ->property(['icon' => null])
            ->log();

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }

    private function deleteStoredIcon(Server $server): void
    {
        if (!$server->icon || !str_starts_with($server->icon, '/storage/server-icons/')) {
            return;
        }

        $relative = ltrim(substr($server->icon, strlen('/storage/')), '/');
        if ($relative !== '') {
            Storage::disk('public')->delete($relative);
        }
    }

    /**
     * Reinstalls the server on the daemon.
     *
     * @throws \Throwable
     */
    public function reinstall(ReinstallServerRequest $request, Server $server): JsonResponse
    {
        $this->reinstallServerService->handle($server);

        Activity::event('server:reinstall')->log();

        return new JsonResponse([], Response::HTTP_ACCEPTED);
    }

    /**
     * Changes the Docker image in use by the server.
     *
     * @throws \Throwable
     */
    public function dockerImage(SetDockerImageRequest $request, Server $server): JsonResponse
    {
        if (!in_array($server->image, array_values($server->egg->docker_images))) {
            throw new BadRequestHttpException('This server\'s Docker image has been manually set by an administrator and cannot be updated.');
        }

        $original = $server->image;
        $server->forceFill(['image' => $request->input('docker_image')])->saveOrFail();

        if ($original !== $server->image) {
            Activity::event('server:startup.image')
                ->property(['old' => $original, 'new' => $request->input('docker_image')])
                ->log();
        }

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }
}
